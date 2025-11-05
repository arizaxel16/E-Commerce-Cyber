package cognito.backend.controller;

import cognito.backend.dto.AuthResponse;
import cognito.backend.dto.LoginRequest;
import cognito.backend.dto.RegisterRequest;
import cognito.backend.dto.UserDTO;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.User;
import cognito.backend.repository.UserRepository;
import cognito.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-photo/{userId}")
    public ResponseEntity<Map<String, String>> uploadUserPhoto(
            @PathVariable UUID userId,
            @RequestParam MultipartFile file) {

        try {
            // Validar archivo
            if (file.isEmpty()) {
                throw new BadRequestException("El archivo está vacío");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Solo se permiten imágenes");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                throw new BadRequestException("Máximo 5MB");
            }

            // Obtener usuario
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            // Guardar archivo
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String filename = "user-" + userId + ".jpg";
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Actualizar usuario
            user.setPhotoPath("/uploads/" + filename);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("photoPath", "/uploads/" + filename));
        } catch (Exception e) {
            throw new BadRequestException("Error al subir foto: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserDTO>> getPendingUsers() {
        List<UserDTO> users = authService.getPendingUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> approveUser(@PathVariable UUID userId) {
        UserDTO user = authService.approveUser(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID userId) {
        UserDTO user = authService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
}
