-- database/init.sql
CREATE TABLE IF NOT EXISTS categorias (
                                          id SERIAL PRIMARY KEY,
                                          nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS productos (
                                         id SERIAL PRIMARY KEY,
                                         nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    precio_anterior DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    categoria_id INTEGER REFERENCES categorias(id),
    imagen_url TEXT,
    marca VARCHAR(100),
    especificaciones JSONB,
    destacado BOOLEAN DEFAULT false,
    descuento INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS clientes (
                                        id SERIAL PRIMARY KEY,
                                        nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(50),
    codigo_postal VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS ventas (
                                      id SERIAL PRIMARY KEY,
                                      cliente_id INTEGER REFERENCES clientes(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    metodo_pago VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS detalle_venta (
                                             id SERIAL PRIMARY KEY,
                                             venta_id INTEGER REFERENCES ventas(id),
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
    );

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, icono) VALUES
                                                        ('Procesadores', 'CPUs para gaming y trabajo profesional', 'microchip'),
                                                        ('Tarjetas Gráficas', 'GPUs de última generación', 'chess-board'),
                                                        ('Memoria RAM', 'Módulos de memoria DDR4 y DDR5', 'memory'),
                                                        ('Placas Base', 'Motherboards para todos los sockets', 'microchip'),
                                                        ('Almacenamiento', 'SSD y HDD de alta velocidad', 'hdd'),
                                                        ('Refrigeración', 'Sistemas de enfriamiento', 'fan'),
                                                        ('Periféricos', 'Teclados, mouse, monitores', 'keyboard'),
                                                        ('Fuentes de Poder', 'Fuentes certificadas', 'bolt');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen_url, marca, destacado, descuento) VALUES
                                                                                                                      ('AMD Ryzen 9 5900X', 'Procesador de 12 núcleos y 24 hilos', 8500, 15, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'AMD', true, 10),
                                                                                                                      ('NVIDIA RTX 3080', 'Tarjeta gráfica 10GB GDDR6X', 18500, 8, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704', 'NVIDIA', true, 5),
                                                                                                                      ('Corsair Vengeance 32GB', 'Memoria RAM DDR4 3200MHz', 3200, 25, 3, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', 'Corsair', true, 15),
                                                                                                                      ('Samsung 970 EVO 1TB', 'SSD NVMe M.2', 2800, 30, 5, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'Samsung', false, 0),
                                                                                                                      ('Intel Core i9-12900K', 'Procesador 16 núcleos', 9200, 10, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'Intel', true, 8),
                                                                                                                      ('ASUS ROG Strix B550-F', 'Placa base gaming', 3500, 12, 4, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', 'ASUS', false, 0);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();