package cognito.backend.service;

import cognito.backend.dto.PaymentDTO;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ForbiddenException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Order;
import cognito.backend.model.Payment;
import cognito.backend.model.User;
import cognito.backend.repository.OrderRepository;
import cognito.backend.repository.PaymentRepository;
import cognito.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentDTO processPayment(UUID orderId, String cardNumber, String cardBrand) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new BadRequestException("El pedido no está pendiente de pago");
        }
        if (!cardNumber.startsWith("4000") && !cardNumber.startsWith("5000")) {
            throw new BadRequestException("Use tarjetas de prueba que empiecen con 4000 o 5000");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod("CARD");
        payment.setAmount(order.getTotalAmount());
        payment.setCardLast4(cardNumber.substring(cardNumber.length() - 4));
        payment.setCardBrand(cardBrand);

        String token = "tok_" + UUID.randomUUID().toString().replace("-", "");
        payment.setCardToken(token);

        payment.setEncryptedCardData(null);

        payment.setPaymentStatus("SUCCESSFUL");
        payment.setProcessedAt(OffsetDateTime.now());
        payment.setNote("Pago simulado procesado exitosamente");

        Payment savedPayment = paymentRepository.save(payment);

        order.setStatus("PAID");
        orderRepository.save(order);

        return convertToDTO(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentByOrderId(UUID orderId, UUID authenticatedUserId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        User requester = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario solicitante no encontrado"));

        if (!order.getUser().getId().equals(authenticatedUserId) && !"ADMIN".equals(requester.getRole())) {
            throw new ForbiddenException("No tienes permiso para ver este pago.");
        }

        Payment payment = order.getPayments().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró pago para este pedido"));

        return convertToDTO(payment);
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        return order.getPayments().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró pago para este pedido"));
    }

    private PaymentDTO convertToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .processedAt(payment.getProcessedAt())
                .cardLast4(payment.getCardLast4())
                .cardBrand(payment.getCardBrand())
                .note(payment.getNote())
                .build();
    }
}
