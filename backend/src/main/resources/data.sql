
-- DATOS INICIALES (Se ejecutan al iniciar)

-- Insertar primer admin
INSERT INTO users (id, email, password_hash, full_name, role, status, is_email_verified, created_at, updated_at)
VALUES (
           '12345678-1234-1234-1234-123456789012',
           'admin@arepabuelas.com',
           '$2a$12$OKpjiBXacDDVLt/wYD8h6.6R18NvKfzar7hwlDDPgc376HwWXONjO',  -- password: 'admin123'
           'Admin User',
           'ADMIN',
           'ACTIVE',
           true,
           NOW(),
           NOW()
       ) ON CONFLICT (email) DO NOTHING;


-- PRODUCTOS INICIALES

INSERT INTO products (id, sku, name, description, price, stock, is_active, created_at, updated_at)
VALUES
    (
        '22345678-1234-1234-1234-123456789001',
        'PROD-AREPA-001',
        'Arepa de Queso',
        'Deliciosa arepa boyacense rellena de queso fresco derretido',
        5000.00,
        50,
        true,
        NOW(),
        NOW()
    ),
    (
        '22345678-1234-1234-1234-123456789002',
        'PROD-AREPA-002',
        'Arepa de Carne',
        'Arepa con carne molida sazonada y cebolla',
        6000.00,
        40,
        true,
        NOW(),
        NOW()
    ),
    (
        '22345678-1234-1234-1234-123456789003',
        'PROD-AREPA-003',
        'Arepa de Huevo',
        'Arepa con huevo frito y queso fresco',
        4500.00,
        60,
        true,
        NOW(),
        NOW()
    ),
    (
        '22345678-1234-1234-1234-123456789004',
        'PROD-AREPA-004',
        'Arepa de Reina Pepiada',
        'Arepa con pollo deshilachado, aguacate y mayonesa',
        7000.00,
        35,
        true,
        NOW(),
        NOW()
    ),
    (
        '22345678-1234-1234-1234-123456789005',
        'PROD-AREPA-005',
        'Arepa de Champiñones',
        'Arepa vegetariana con champiñones salteados y queso',
        5500.00,
        45,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (sku) DO NOTHING;


-- CUPÓN PARA NUEVOS USUARIOS

INSERT INTO coupons (id, code, description, discount_type, discount_value, new_user_only, max_redemptions, created_at)
VALUES
    (
        '33345678-1234-1234-1234-123456789001',
        'BIENVENIDO',
        '10% de descuento para nuevos usuarios',
        'PERCENTAGE',
        10.00,
        true,
        100,
        NOW()
    )
    ON CONFLICT (code) DO NOTHING;
