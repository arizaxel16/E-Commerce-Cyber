package cognito.backend.service;

import cognito.backend.dto.CreateProductRequest;
import cognito.backend.dto.ProductDTO;
import cognito.backend.dto.ProductImageDTO;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Product;
import cognito.backend.model.ProductImage;
import cognito.backend.repository.ProductImageRepository;
import cognito.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

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

    @Transactional(readOnly = true)
    public List<ProductImageDTO> getImagesForProduct(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        List<ProductImage> images = productImageRepository.findByProductId(productId);

        return images.stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductImageDTO uploadProductImage(UUID productId, MultipartFile file, boolean isPrimary) {

        if (file.isEmpty()) {
            throw new BadRequestException("El archivo está vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Solo se permiten archivos de imagen");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("El archivo no puede exceder 5MB");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            Files.write(filePath, file.getBytes());

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setFilePath("/uploads/" + filename);
            image.setPrimary(isPrimary);

            ProductImage savedImage = productImageRepository.save(image);

            return convertImageToDTO(savedImage);

        } catch (IOException e) {
            throw new BadRequestException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    public ProductImageDTO setPrimaryImage(UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada"));

        Product product = image.getProduct();
        product.getImages().forEach(img -> img.setPrimary(false));

        image.setPrimary(true);
        ProductImage updated = productImageRepository.save(image);

        return convertImageToDTO(updated);
    }

    private ProductImageDTO convertImageToDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .filePath(image.getFilePath())
                .isPrimary(image.isPrimary())
                .build();
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
