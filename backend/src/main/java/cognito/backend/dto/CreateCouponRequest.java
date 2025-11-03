package cognito.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class CreateCouponRequest {

    @NotBlank(message = "El código del cupón es requerido")
    private String code;

    private String description;

    @NotBlank(message = "El tipo de descuento es requerido")
    private String discountType; // PERCENTAGE o FIXED_AMOUNT

    @NotNull(message = "El valor del descuento es requerido")
    @Positive(message = "El valor del descuento debe ser positivo")
    private BigDecimal discountValue;

    private Boolean newUserOnly = false;
    private OffsetDateTime validFrom;
    private OffsetDateTime validTo;
    private Integer maxRedemptions;
}
