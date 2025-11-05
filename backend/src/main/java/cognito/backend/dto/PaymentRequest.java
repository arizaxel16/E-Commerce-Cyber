// Ruta: backend/src/main/java/cognito/backend/dto/PaymentRequest.java

package cognito.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class PaymentRequest {
    @NotNull
    private UUID orderId;

    @NotBlank
    // @Pattern(regexp = "^[0-9]{13,19}$", message = "Número de tarjeta de prueba inválido")
    private String cardNumber;

    @NotBlank
    private String cardBrand;
}