package cognito.backend.controller;

import cognito.backend.dto.AuthResponse;
import cognito.backend.dto.LoginRequest;
import cognito.backend.dto.RegisterRequest;
import cognito.backend.dto.UserDTO;
import cognito.backend.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response){
        AuthResponse authResponse = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("jwt_token", authResponse.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60 * 60 * 24)
                .sameSite("Strict")
                // 'Strict' es lo más seguro. Usa 'Lax' si tienes problemas con redirecciones.
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        authResponse.setToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, String>> uploadUserPhoto(
            @RequestParam MultipartFile file,
            Principal principal) {

        UUID authenticatedUserId = UUID.fromString(principal.getName());

        String photoPath = authService.uploadUserPhoto(authenticatedUserId, file);

        return ResponseEntity.ok(Map.of("photoPath", photoPath));
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
