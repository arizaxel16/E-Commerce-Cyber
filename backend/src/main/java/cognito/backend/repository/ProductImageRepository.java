package cognito.backend.repository;
import cognito.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
}
