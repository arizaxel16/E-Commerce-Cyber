// Ruta: backend/src/main/java/cognito/backend/controller/ProductCommentController.java

package cognito.backend.controller;

import cognito.backend.dto.CommentRequest;
import cognito.backend.dto.CommentDTO;
import cognito.backend.service.CommentService; // ¡NUEVO!
import jakarta.validation.Valid; // ¡NUEVO!
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // ¡NUEVO!
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class ProductCommentController {

    private final CommentService commentService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<CommentDTO>> getProductComments(@PathVariable UUID productId) {
        List<CommentDTO> comments = commentService.getCommentsForProduct(productId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommentDTO> createComment(
            @Valid @RequestBody CommentRequest request,
            Principal principal) {

        UUID authenticatedUserId = UUID.fromString(principal.getName());

        CommentDTO savedComment = commentService.createComment(request, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable UUID productId) {
        Double avgRating = commentService.getAverageRatingForProduct(productId);
        return ResponseEntity.ok(Map.of("averageRating", avgRating));
    }
}