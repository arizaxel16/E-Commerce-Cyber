package cognito.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Esto inyectará el valor de 'file.upload-dir' de tu application.properties
    // (que en Docker es /app/uploads)
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Esto le dice a Spring Boot que cualquier petición web
     * que comience con /uploads/**
     * debe servirse desde el directorio en el disco duro
     * especificado por 'uploadDir'.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // La ruta web (lo que ve el navegador)
        String resourcePath = "/uploads/**";

        // La ubicación en el disco (dentro del contenedor)
        // "file:" es crucial para decirle a Spring que es una ruta del sistema de archivos
        String resourceLocation = "file:" + uploadDir + "/";

        registry.addResourceHandler(resourcePath)
                .addResourceLocations(resourceLocation);
    }
}