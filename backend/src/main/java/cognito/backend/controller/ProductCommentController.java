package cognito.backend.controller;

import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.ProductComment;
import cognito.backend.model.User;
import cognito.backend.repository.ProductCommentRepository;
import cognito.backend.repository.ProductRepository;
import cognito.backend.repository.UserRepository;
import cognito.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductCommentController {

    private final ProductCommentRepository commentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * Obtener comentarios de un producto
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductComment>> getProductComments(@PathVariable UUID productId) {
        // Verificar que el producto existe
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        // Obtener comentarios visibles
        List<ProductComment> comments = commentRepository.findAll().stream()
                .filter(c -> c.getProduct().getId().equals(productId) && c.isVisible())
                .toList();

        return ResponseEntity.ok(comments);
    }

    /**
     * Crear comentario (requiere autenticación)
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProductComment> createComment(
            @RequestParam UUID productId,
            @RequestParam(required = false) Short rating,
            @RequestBody String content,
            HttpServletRequest request) {

        // Validar que el contenido no esté vacío
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("El comentario no puede estar vacío");
        }

        // Validar rating (1-5)
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("El rating debe ser entre 1 y 5");
        }

        // Obtener el token del header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token no encontrado");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        // Obtener el usuario autenticado
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Obtener el producto
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        // Crear comentario
        ProductComment comment = new ProductComment();
        comment.setProduct(product);
        comment.setUser(user);
        comment.setRating(rating);
        comment.setContent(content);
        comment.setVisible(true);

        ProductComment savedComment = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    /**
     * Obtener rating promedio de un producto
     */
    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable UUID productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        double avgRating = commentRepository.findAll().stream()
                .filter(c -> c.getProduct().getId().equals(productId) && c.isVisible() && c.getRating() != null)
                .mapToInt(c -> c.getRating().intValue())
                .average()
                .orElse(0.0);

        return ResponseEntity.ok(avgRating);
    }
}
