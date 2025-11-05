// Ruta: backend/src/main/java/cognito/backend/controller/PaymentController.java

package cognito.backend.controller;

import cognito.backend.dto.PaymentDTO;
import cognito.backend.model.Payment;
import cognito.backend.dto.PaymentRequest;
import cognito.backend.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal; // ¡NUEVO!
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentDTO> processPayment(
            @Valid @RequestBody PaymentRequest request) { // <-- ¡ACTUALIZADO!

        PaymentDTO paymentDto = paymentService.processPayment(
                request.getOrderId(),
                request.getCardNumber(),
                request.getCardBrand()
        );
        return ResponseEntity.ok(paymentDto);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDTO> getPaymentByOrderId(
            @PathVariable UUID orderId,
            Principal principal) {

        UUID authenticatedUserId = UUID.fromString(principal.getName());
        PaymentDTO paymentDto = paymentService.getPaymentByOrderId(orderId, authenticatedUserId);
        return ResponseEntity.ok(paymentDto);
    }
}