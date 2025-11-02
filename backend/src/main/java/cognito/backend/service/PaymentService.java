package cognito.backend.service;

import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Order;
import cognito.backend.model.Payment;
import cognito.backend.repository.OrderRepository;
import cognito.backend.repository.PaymentRepository;
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

    @Transactional
    public Payment processPayment(UUID orderId, String cardNumber, String cardBrand) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new BadRequestException("El pedido no está pendiente de pago");
        }

        // Validar número de tarjeta simulado (NO USAR TARJETAS REALES)
        if (!cardNumber.startsWith("4000") && !cardNumber.startsWith("5000")) {
            throw new BadRequestException("Use tarjetas de prueba que empiecen con 4000 o 5000");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod("CARD");
        payment.setAmount(order.getTotalAmount());
        payment.setCardLast4(cardNumber.substring(cardNumber.length() - 4));
        payment.setCardBrand(cardBrand);

        // Simular tokenización (en producción usar Stripe, PayPal, etc.)
        String token = "tok_" + UUID.randomUUID().toString().replace("-", "");
        payment.setCardToken(token);

        // NO almacenar datos completos de tarjeta
        // En producción, encriptar con AES-256 o usar tokenización externa
        payment.setEncryptedCardData(null);

        // Simular procesamiento
        payment.setPaymentStatus("SUCCESSFUL");
        payment.setProcessedAt(OffsetDateTime.now());
        payment.setNote("Pago simulado procesado exitosamente");

        Payment savedPayment = paymentRepository.save(payment);

        // Actualizar estado del pedido
        order.setStatus("PAID");
        orderRepository.save(order);

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        return order.getPayments().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró pago para este pedido"));
    }
}
