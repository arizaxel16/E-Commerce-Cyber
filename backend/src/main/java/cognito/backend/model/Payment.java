// Ruta: backend/src/main/java/cognito/backend/model/Payment.java

package cognito.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String paymentMethod;

    @Column(nullable = false)
    private String paymentStatus; // 'SUCCESSFUL', 'FAILED'

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private OffsetDateTime processedAt;

    // --- PCI Data (Tokenized) ---
    private String cardLast4;
    private String cardBrand;

    @ToString.Exclude // OWASP: No loguear tokens
    private String cardToken;

    @Lob // Large Object
    @ToString.Exclude
    private byte[] encryptedCardData; // Simulación de Vault

    private String note;

    // --- Relaciones ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}