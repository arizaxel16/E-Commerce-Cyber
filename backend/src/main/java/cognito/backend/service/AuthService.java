package cognito.backend.service;

import cognito.backend.dto.AuthResponse;
import cognito.backend.dto.LoginRequest;
import cognito.backend.dto.RegisterRequest;
import cognito.backend.dto.UserDTO;
import cognito.backend.exception.BadRequestException;
import cognito.backend.exception.ResourceNotFoundException;
import cognito.backend.model.User;
import cognito.backend.repository.UserRepository;
import cognito.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public AuthResponse registerAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");
        user.setStatus("ACTIVE");
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .message("Admin registrado exitosamente")
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setStatus("PENDING");
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .message("Usuario registrado exitosamente. Pendiente de aprobación del administrador.")
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Credenciales inválidas");
        }

        if ("PENDING".equals(user.getStatus())) {
            throw new BadRequestException("Tu cuenta está pendiente de aprobación");
        }

        if ("BANNED".equals(user.getStatus()) || "SUSPENDED".equals(user.getStatus())) {
            throw new BadRequestException("Tu cuenta ha sido suspendida");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getId().toString()
        );

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .token(token)
                .message("Inicio de sesión exitoso")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getUserData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado (token inválido)"));

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .message("Sesión validada")
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(user -> "PENDING".equals(user.getStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO approveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setStatus("ACTIVE");
        User updatedUser = userRepository.save(user);

        return convertToDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return convertToDTO(user);
    }

    @Transactional
    public String uploadUserPhoto(UUID authenticatedUserId, MultipartFile file) {

        try {
            if (file.isEmpty()) {
                throw new BadRequestException("El archivo está vacío");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Solo se permiten imágenes");
            }
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                throw new BadRequestException("Máximo 5MB");
            }

            User user = userRepository.findById(authenticatedUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String filename = "user-" + authenticatedUserId + ".jpg";
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            String photoPath = "/uploads/" + filename;
            user.setPhotoPath(photoPath);
            userRepository.save(user);

            return photoPath;

        } catch (IOException e) {
            throw new BadRequestException("Error al guardar el archivo: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Error al subir foto: " + e.getMessage());
        }
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .photoPath(user.getPhotoPath())
                .role(user.getRole())
                .status(user.getStatus())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
