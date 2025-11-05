package cognito.backend.controller;

import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.Product;
import cognito.backend.model.ProductImage;
import cognito.backend.repository.ProductImageRepository;
import cognito.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-images")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductImageController {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Obtener imágenes de un producto
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImage>> getProductImages(@PathVariable UUID productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        List<ProductImage> images = productImageRepository.findAll().stream()
                .filter(img -> img.getProduct().getId().equals(productId))
                .toList();

        return ResponseEntity.ok(images);
    }

    /**
     * Subir imagen para un producto (Solo ADMIN)
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImage> uploadImage(
            @RequestParam UUID productId,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {

        // Validar que el archivo no esté vacío
        if (file.isEmpty()) {
            throw new BadRequestException("El archivo está vacío");
        }

        // Validar tipo de archivo (solo imágenes)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Solo se permiten archivos de imagen");
        }

        // Validar tamaño (máximo 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("El archivo no puede exceder 5MB");
        }

        // Obtener el producto
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        try {
            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            // Generar nombre único para el archivo
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            // Guardar archivo
            Files.write(filePath, file.getBytes());

            // Crear registro en BD
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setFilePath("/uploads/" + filename);
            image.setPrimary(isPrimary);

            ProductImage savedImage = productImageRepository.save(image);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);

        } catch (IOException e) {
            throw new BadRequestException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    /**
     * Marcar imagen como principal
     */
    @PutMapping("/{imageId}/set-primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImage> setPrimaryImage(@PathVariable UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada"));

        // Desmarcar otras imágenes del mismo producto como principal
        Product product = image.getProduct();
        product.getImages().forEach(img -> img.setPrimary(false));

        // Marcar esta como principal
        image.setPrimary(true);
        ProductImage updated = productImageRepository.save(image);

        return ResponseEntity.ok(updated);
    }
}
