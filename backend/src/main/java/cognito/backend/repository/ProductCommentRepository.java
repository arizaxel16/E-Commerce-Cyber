package cognito.backend.repository;

import cognito.backend.model.ProductComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductCommentRepository extends JpaRepository<ProductComment, UUID> {

    List<ProductComment> findByProductIdAndIsVisibleTrue(UUID productId);

    @Query("SELECT AVG(c.rating) FROM ProductComment c WHERE c.product.id = :productId AND c.isVisible = true AND c.rating IS NOT NULL")
    Double getAverageRatingForProduct(UUID productId);

}