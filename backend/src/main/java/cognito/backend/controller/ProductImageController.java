// Ruta: backend/src/main/java/cognito/backend/controller/ProductImageController.java

package cognito.backend.controller;

import cognito.backend.dto.ProductImageDTO; // ¡NUEVO!
import cognito.backend.service.ProductService; // ¡NUEVO!
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductService productService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageDTO>> getProductImages(@PathVariable UUID productId) {
        List<ProductImageDTO> images = productService.getImagesForProduct(productId);
        return ResponseEntity.ok(images);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageDTO> uploadImage(
            @RequestParam UUID productId,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {

        ProductImageDTO savedImage = productService.uploadProductImage(productId, file, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
    }


    @PutMapping("/{imageId}/set-primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageDTO> setPrimaryImage(@PathVariable UUID imageId) {
        ProductImageDTO updated = productService.setPrimaryImage(imageId);
        return ResponseEntity.ok(updated);
    }
}