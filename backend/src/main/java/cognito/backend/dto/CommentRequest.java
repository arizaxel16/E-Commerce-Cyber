package cognito.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CommentRequest {

    @NotNull(message = "El ID del producto es requerido")
    private UUID productId;

    @NotBlank(message = "El contenido del comentario es requerido")
    private String content;

    @NotNull(message = "El rating es requerido")
    @Min(value = 1, message = "El rating debe ser como mínimo 1")
    @Max(value = 5, message = "El rating debe ser como máximo 5")
    private Short rating;
}