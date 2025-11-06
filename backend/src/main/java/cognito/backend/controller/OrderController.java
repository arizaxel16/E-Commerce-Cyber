package cognito.backend.controller;

import cognito.backend.dto.CreateOrderRequest;
import cognito.backend.dto.OrderDTO;
import cognito.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Principal principal) { // <-- ¡HALLAZGO 3 CORREGIDO!

        UUID userId = UUID.fromString(principal.getName());
        OrderDTO order = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Principal principal) { // <-- ¡HALLAZGO 4 CORREGIDO!
        UUID userId = UUID.fromString(principal.getName());
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable UUID orderId, Principal principal) {
        // ¡HALLAZGO 5 CORREGIDO! (parcialmente)
        // Nota: OrderService debe ser actualizado para:
        // 1. Aceptar 'principal.getName()' (el userId)
        // 2. Verificar que el pedido pertenece a ese usuario O el usuario es ADMIN.
        // Por ahora, lo enviamos al servicio.
        OrderDTO order = orderService.getOrderByIdForUser(orderId, UUID.fromString(principal.getName()));
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {
        OrderDTO order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')") // <-- Endpoint de admin seguro
    public ResponseEntity<List<OrderDTO>> getOrdersForUserByAdmin(@PathVariable UUID userId) {
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
}
