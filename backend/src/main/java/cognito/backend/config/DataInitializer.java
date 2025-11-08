package cognito.backend.config;

import cognito.backend.model.User;
import cognito.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime; // <-- ¡Corregido!
import java.util.UUID;

/**
 * Este componente se ejecuta una sola vez al arrancar la aplicación.
 * Su trabajo es crear el usuario Administrador si no existe.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String adminEmail = "admin@arepabuelas.com";

        // 1. Revisa si el admin ya existe
        if (!userRepository.findByEmail(adminEmail).isPresent()) {

            User adminUser = new User();

            // ¡NO ESTABLECER EL ID! @GeneratedValue se encargará.
            // adminUser.setId(UUID.randomUUID()); // <-- LÍNEA ELIMINADA

            adminUser.setFullName("Administrador");
            adminUser.setEmail(adminEmail);
            adminUser.setPasswordHash(passwordEncoder.encode("SiNosEstasHackeandoEresEnaPerra@!*$"));
            adminUser.setRole("ADMIN");
            adminUser.setStatus("ACTIVE");
            adminUser.setEmailVerified(true);
            adminUser.setCreatedAt(OffsetDateTime.now());
            adminUser.setUpdatedAt(OffsetDateTime.now());

            // 6. Guarda el usuario en la base de datos (¡Ahora funcionará!)
            userRepository.save(adminUser);

            System.out.println(">>> Usuario Administrador 'admin@arepabuelas.com' creado exitosamente. <<<");
        }
    }
}