package cognito.backend.service;

import cognito.backend.dto.CreateProductRequest;
import cognito.backend.dto.ProductDTO;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Product;
import cognito.backend.model.ProductImage;
import cognito.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setActive(true);
        product.setSku("PROD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDTO convertToDTO(Product product) {
        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream()
                .map(ProductImage::getFilePath)
                .collect(Collectors.toList())
                : List.of();

        Double avgRating = product.getComments() != null && !product.getComments().isEmpty()
                ? product.getComments().stream()
                .mapToInt(c -> c.getRating() != null ? c.getRating() : 0)
                .average()
                .orElse(0.0)
                : 0.0;

        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .isActive(product.isActive())
                .imageUrls(imageUrls)
                .totalComments(product.getComments() != null ? product.getComments().size() : 0)
                .averageRating(avgRating)
                .build();
    }
}
