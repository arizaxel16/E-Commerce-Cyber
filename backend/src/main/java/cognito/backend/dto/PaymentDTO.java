package cognito.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentDTO {
    private UUID id;
    private UUID orderId;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private OffsetDateTime processedAt;

    // Solo datos de tarjeta no sensibles
    private String cardLast4;
    private String cardBrand;
    private String note;
}