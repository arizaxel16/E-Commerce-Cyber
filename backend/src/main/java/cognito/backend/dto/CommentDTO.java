package cognito.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentDTO {
    private UUID id;
    private String content;
    private Short rating;
    private OffsetDateTime createdAt;
    private UUID productId;

    private UUID userId;
    private String userFullName;
}