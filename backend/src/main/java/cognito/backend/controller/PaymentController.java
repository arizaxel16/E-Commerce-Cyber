package cognito.backend.controller;

import cognito.backend.model.Payment;
import cognito.backend.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(
                request.getOrderId(),
                request.getCardNumber(),
                request.getCardBrand()
        );
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable UUID orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }
}

@Data
class PaymentRequest {
    private UUID orderId;
    private String cardNumber; // Solo tarjetas de prueba: 4000XXXXXXXXXXXX o 5000XXXXXXXXXXXX
    private String cardBrand;
}
