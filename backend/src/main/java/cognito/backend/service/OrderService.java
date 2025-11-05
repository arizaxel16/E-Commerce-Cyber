package cognito.backend.service;

import cognito.backend.dto.CreateOrderRequest;
import cognito.backend.dto.OrderDTO;
import cognito.backend.dto.OrderItemDTO;
import cognito.backend.dto.OrderItemRequest;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.*;
import cognito.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cognito.backend.exception.ForbiddenException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    @Transactional
    public OrderDTO createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("El usuario debe estar activo para realizar pedidos");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());

        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + itemRequest.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("El producto " + product.getName() + " no está disponible");
            }

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new BadRequestException("Stock insuficiente para el producto: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            orderItem.setTotalPrice(itemTotal);

            orderItems.add(orderItem);
            subtotal = subtotal.add(itemTotal);

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        BigDecimal total = subtotal;

        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new BadRequestException("Cupón inválido"));

            validateCoupon(coupon, user);

            BigDecimal discount = calculateDiscount(subtotal, coupon);
            total = subtotal.subtract(discount);

            if (total.compareTo(BigDecimal.ZERO) < 0) {
                total = BigDecimal.ZERO;
            }

            order.setCoupon(coupon);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new BadRequestException("Cupón inválido"));

            CouponRedemption redemption = new CouponRedemption();
            redemption.setCoupon(coupon);
            redemption.setUser(user);
            redemption.setOrder(savedOrder);
            couponRedemptionRepository.save(redemption);
        }

        return convertToDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Order> orders = orderRepository.findByUser(user);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByIdAdmin(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByIdForUser(UUID orderId, UUID authenticatedUserId) {
        User requester = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario solicitante no encontrado"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!order.getUser().getId().equals(authenticatedUserId)) {

            if (!"ADMIN".equals(requester.getRole())) {

                throw new ForbiddenException("No tienes permiso para ver este pedido.");
            }
        }
        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(UUID orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        List<String> validStatuses = List.of("PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(newStatus)) {
            throw new BadRequestException("Estado inválido: " + newStatus);
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return convertToDTO(updatedOrder);
    }

    private void validateCoupon(Coupon coupon, User user) {
        OffsetDateTime now = OffsetDateTime.now();

        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new BadRequestException("El cupón aún no es válido");
        }

        if (coupon.getValidTo() != null && now.isAfter(coupon.getValidTo())) {
            throw new BadRequestException("El cupón ha expirado");
        }

        if (coupon.isNewUserOnly()) {
            List<Order> userOrders = orderRepository.findByUser(user);
            if (!userOrders.isEmpty()) {
                throw new BadRequestException("Este cupón es solo para nuevos usuarios");
            }
        }

        if (coupon.getMaxRedemptions() != null) {
            long redemptionCount = couponRedemptionRepository.count();
            if (redemptionCount >= coupon.getMaxRedemptions()) {
                throw new BadRequestException("El cupón ha alcanzado su límite de usos");
            }
        }
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, Coupon coupon) {
        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
            return subtotal.multiply(coupon.getDiscountValue()).divide(new BigDecimal(100));
        } else if ("FIXED_AMOUNT".equals(coupon.getDiscountType())) {
            return coupon.getDiscountValue();
        }
        return BigDecimal.ZERO;
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .createdAt(order.getCreatedAt())
                .items(itemDTOs)
                .build();
    }
}
