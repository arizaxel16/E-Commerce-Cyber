package cognito.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotEmpty(message = "La orden debe contener al menos un producto")
    @Valid
    private List<OrderItemRequest> items;

    private String couponCode;
    private String shippingAddress;
    private String billingAddress;
}
