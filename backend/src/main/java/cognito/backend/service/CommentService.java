package cognito.backend.service;

import cognito.backend.dto.CommentRequest;
import cognito.backend.dto.CommentDTO;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Product;
import cognito.backend.model.ProductComment;
import cognito.backend.model.User;
import cognito.backend.repository.ProductCommentRepository;
import cognito.backend.repository.ProductRepository;
import cognito.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final ProductCommentRepository commentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;


    @Transactional
    public CommentDTO createComment(CommentRequest request, UUID authenticatedUserId) {

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        ProductComment comment = new ProductComment();
        comment.setProduct(product);
        comment.setUser(user);
        comment.setRating(request.getRating());
        comment.setContent(request.getContent());
        comment.setVisible(true);

        ProductComment savedComment = commentRepository.save(comment);

        return convertToDTO(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsForProduct(UUID productId) {

        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        List<ProductComment> comments = commentRepository.findByProductIdAndIsVisibleTrue(productId);

        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForProduct(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        Double avgRating = commentRepository.getAverageRatingForProduct(productId);

        return (avgRating != null) ? avgRating : 0.0;
    }

    private CommentDTO convertToDTO(ProductComment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .rating(comment.getRating())
                .createdAt(comment.getCreatedAt())
                .productId(comment.getProduct().getId())
                .userId(comment.getUser().getId())
                .userFullName(comment.getUser().getFullName())
                .build();
    }
}