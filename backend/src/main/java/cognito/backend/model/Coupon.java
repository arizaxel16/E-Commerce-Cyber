// Ruta: backend/src/main/java/cognito/backend/model/Coupon.java

package cognito.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Column(nullable = false)
    private String discountType; // 'PERCENTAGE', 'FIXED_AMOUNT'

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(columnDefinition = "boolean default false")
    private boolean newUserOnly;

    private OffsetDateTime validFrom;
    private OffsetDateTime validTo;
    private Integer maxRedemptions;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}