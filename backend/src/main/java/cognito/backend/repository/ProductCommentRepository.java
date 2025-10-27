package cognito.backend.repository;
import cognito.backend.model.ProductComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductCommentRepository extends JpaRepository<ProductComment, UUID> {
}
