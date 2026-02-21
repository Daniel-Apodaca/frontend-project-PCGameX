import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pcgamex',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
});

// Test de conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
    } else {
        console.log('✅ Conectado a PostgreSQL exitosamente');
        release();
    }
});

// ============= ENDPOINTS PÚBLICOS =============

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: 'connected'
    });
});

// Endpoint de diagnóstico
app.get('/api/diagnostico', async (req, res) => {
    try {
        console.log('🔍 Ejecutando diagnóstico...');

        const results = {};

        // Verificar productos
        const productos = await pool.query('SELECT COUNT(*) as total FROM productos');
        results.total_productos = parseInt(productos.rows[0].total);

        // Verificar productos destacados
        const destacados = await pool.query('SELECT COUNT(*) as total FROM productos WHERE destacado = true');
        results.productos_destacados = parseInt(destacados.rows[0].total);

        // Verificar categorías
        const categorias = await pool.query('SELECT COUNT(*) as total FROM categorias');
        results.total_categorias = parseInt(categorias.rows[0].total);

        // Verificar estructura de tabla productos
        const estructura = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'productos'
            ORDER BY ordinal_position
        `);
        results.columnas_productos = estructura.rows;

        // Verificar estructura de tabla categorias
        const estructuraCat = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categorias'
            ORDER BY ordinal_position
        `);
        results.columnas_categorias = estructuraCat.rows;

        // Obtener muestra de productos
        const muestra = await pool.query(`
            SELECT id, nombre, destacado, precio, stock, categoria_id 
            FROM productos 
            LIMIT 5
        `);
        results.muestra_productos = muestra.rows;

        // Verificar productos por categoría
        const porCategoria = await pool.query(`
            SELECT c.nombre, COUNT(p.id) as total
            FROM categorias c
            LEFT JOIN productos p ON c.id = p.categoria_id
            GROUP BY c.id, c.nombre
            ORDER BY c.nombre
        `);
        results.productos_por_categoria = porCategoria.rows;

        console.log('✅ Diagnóstico completado');

        res.json({
            status: 'OK',
            timestamp: new Date(),
            database: 'connected',
            stats: results
        });
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const { categoria, destacado, limite } = req.query;
        let query = `
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE 1=1
        `;
        const values = [];

        if (categoria) {
            values.push(categoria);
            query += ` AND LOWER(c.nombre) = LOWER($${values.length})`;
        }

        if (destacado === 'true') {
            query += ` AND p.destacado = true`;
        }

        query += ` ORDER BY p.destacado DESC, p.created_at DESC`;

        if (limite) {
            values.push(parseInt(limite));
            query += ` LIMIT $${values.length}`;
        }

        console.log('📦 Ejecutando query productos:', query);
        const result = await pool.query(query, values);
        console.log(`✅ ${result.rows.length} productos encontrados`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en /api/productos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener productos destacados
app.get('/api/productos/destacados', async (req, res) => {
    try {
        console.log('⭐ Buscando productos destacados...');

        const query = `
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.destacado = true
            ORDER BY p.id
        `;

        console.log('Ejecutando query:', query);
        const result = await pool.query(query);
        console.log(`✅ ${result.rows.length} productos destacados encontrados`);

        if (result.rows.length > 0) {
            console.log('Primer producto:', result.rows[0]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en /api/productos/destacados:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Buscando producto ID:', id);

        const result = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            console.log('❌ Producto no encontrado:', id);
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        console.log('✅ Producto encontrado:', result.rows[0].nombre);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error en /api/productos/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
    try {
        console.log('📁 Buscando categorías...');

        const query = `
            SELECT c.*, COUNT(p.id) as total_productos
            FROM categorias c
            LEFT JOIN productos p ON c.id = p.categoria_id
            GROUP BY c.id
            ORDER BY c.nombre
        `;

        const result = await pool.query(query);
        console.log(`✅ ${result.rows.length} categorías encontradas`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en /api/categorias:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener productos por categoría
app.get('/api/categorias/:id/productos', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📁 Buscando productos de categoría ID: ${id}`);

        const result = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.categoria_id = $1
            ORDER BY p.destacado DESC, p.created_at DESC
        `, [id]);

        console.log(`✅ ${result.rows.length} productos encontrados en categoría`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en /api/categorias/:id/productos:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= NUEVO: BUSCAR PRODUCTOS MEJORADO =============
app.get('/api/buscar', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.json([]);
        }

        console.log(`🔎 Buscando: "${q}"`);

        const result = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE 
                LOWER(p.nombre) LIKE LOWER($1) OR
                LOWER(p.descripcion) LIKE LOWER($1) OR
                LOWER(p.marca) LIKE LOWER($1) OR
                LOWER(c.nombre) LIKE LOWER($1)
            ORDER BY 
                CASE 
                    WHEN LOWER(p.nombre) LIKE LOWER($2) THEN 1
                    WHEN LOWER(p.nombre) LIKE LOWER($3) THEN 2
                    ELSE 3
                END,
                p.destacado DESC
            LIMIT 20
        `, [`%${q}%`, `${q}%`, `%${q}`]);

        console.log(`✅ ${result.rows.length} resultados encontrados`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en /api/buscar:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= NUEVO: ENDPOINTS DE VENTAS =============

// Crear una venta (checkout)
app.post('/api/ventas', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { items, total, cliente, metodo_pago } = req.body;

        console.log('📝 Procesando venta:', { items, total, metodo_pago });

        // 1. Crear la venta
        const ventaResult = await client.query(
            `INSERT INTO ventas (cliente_id, total, metodo_pago, estado, fecha)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id`,
            [cliente?.id || null, total, metodo_pago || 'efectivo', 'completada']
        );

        const ventaId = ventaResult.rows[0].id;

        // 2. Insertar detalles y actualizar stock
        for (const item of items) {
            // Verificar stock actual
            const stockResult = await client.query(
                'SELECT stock FROM productos WHERE id = $1',
                [item.id]
            );

            if (stockResult.rows.length === 0) {
                throw new Error(`Producto ${item.id} no encontrado`);
            }

            const stockActual = stockResult.rows[0].stock;

            if (stockActual < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.nombre}`);
            }

            // Insertar detalle de venta
            await client.query(
                `INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [ventaId, item.id, item.cantidad, item.precio, item.precio * item.cantidad]
            );

            // Actualizar stock (restando la cantidad comprada)
            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE id = $2',
                [item.cantidad, item.id]
            );

            console.log(`📦 Stock actualizado para producto ${item.id}: ${stockActual} -> ${stockActual - item.cantidad}`);
        }

        await client.query('COMMIT');

        console.log(`✅ Venta ${ventaId} registrada exitosamente`);

        res.json({
            success: true,
            message: 'Venta registrada exitosamente',
            ventaId: ventaId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error procesando venta:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        client.release();
    }
});

// ============= ENDPOINTS DE ADMINISTRACIÓN =============

// Middleware simple de autenticación
const authenticateAdmin = (req, res, next) => {
    const adminToken = req.headers['admin-token'];
    if (adminToken === 'admin123') {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado' });
    }
};

// Login de admin
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({
            success: true,
            token: 'admin123',
            message: 'Login exitoso'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }
});

// ===== CRUD de Productos =====

// Crear producto
app.post('/api/admin/productos', authenticateAdmin, async (req, res) => {
    try {
        const {
            nombre, descripcion, precio, precio_anterior,
            stock, categoria_id, imagen_url, marca,
            destacado, descuento
        } = req.body;

        const query = `
            INSERT INTO productos (
                nombre, descripcion, precio, precio_anterior,
                stock, categoria_id, imagen_url, marca,
                destacado, descuento, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            nombre, descripcion, precio, precio_anterior || null,
            stock, categoria_id, imagen_url, marca,
            destacado || false, descuento || 0
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar producto
app.put('/api/admin/productos/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined && key !== 'id') {
                setClauses.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        setClauses.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE productos 
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto
app.delete('/api/admin/productos/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const ventas = await pool.query(
            'SELECT COUNT(*) FROM detalle_venta WHERE producto_id = $1',
            [id]
        );

        if (parseInt(ventas.rows[0].count) > 0) {
            await pool.query(
                'UPDATE productos SET stock = 0, destacado = false WHERE id = $1',
                [id]
            );
            res.json({ message: 'Producto marcado como inactivo' });
        } else {
            await pool.query('DELETE FROM productos WHERE id = $1', [id]);
            res.json({ message: 'Producto eliminado' });
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== CRUD de Categorías =====

// Crear categoría
app.post('/api/admin/categorias', authenticateAdmin, async (req, res) => {
    try {
        const { nombre, descripcion, icono } = req.body;

        const query = `
            INSERT INTO categorias (nombre, descripcion, icono, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;

        const result = await pool.query(query, [nombre, descripcion, icono]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando categoría:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar categoría
app.put('/api/admin/categorias/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, icono } = req.body;

        const query = `
            UPDATE categorias 
            SET nombre = $1, descripcion = $2, icono = $3
            WHERE id = $4
            RETURNING *
        `;

        const result = await pool.query(query, [nombre, descripcion, icono, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando categoría:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar categoría
app.delete('/api/admin/categorias/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const productos = await pool.query(
            'SELECT COUNT(*) FROM productos WHERE categoria_id = $1',
            [id]
        );

        if (parseInt(productos.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar categoría con productos asociados'
            });
        }

        await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas para dashboard
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = {};

        const totalProductos = await pool.query('SELECT COUNT(*) FROM productos');
        stats.totalProductos = parseInt(totalProductos.rows[0].count);

        const totalCategorias = await pool.query('SELECT COUNT(*) FROM categorias');
        stats.totalCategorias = parseInt(totalCategorias.rows[0].count);

        const stockBajo = await pool.query(
            'SELECT COUNT(*) FROM productos WHERE stock < 5 AND stock > 0'
        );
        stats.stockBajo = parseInt(stockBajo.rows[0].count);

        const agotados = await pool.query(
            'SELECT COUNT(*) FROM productos WHERE stock = 0'
        );
        stats.agotados = parseInt(agotados.rows[0].count);

        const destacados = await pool.query(
            'SELECT COUNT(*) FROM productos WHERE destacado = true'
        );
        stats.destacados = parseInt(destacados.rows[0].count);

        const ultimosProductos = await pool.query(
            'SELECT id, nombre, precio, stock, created_at FROM productos ORDER BY created_at DESC LIMIT 5'
        );
        stats.ultimosProductos = ultimosProductos.rows;

        // NUEVO: Total de ventas
        const totalVentas = await pool.query('SELECT COUNT(*) FROM ventas');
        stats.totalVentas = parseInt(totalVentas.rows[0].count);

        // NUEVO: Ingresos totales
        const ingresosTotales = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM ventas');
        stats.ingresosTotales = parseFloat(ingresosTotales.rows[0].total);

        res.json(stats);
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== NUEVO: ENDPOINTS DE VENTAS PARA ADMIN =====

// Obtener todas las ventas (para admin)
app.get('/api/admin/ventas', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Obteniendo ventas para admin...');

        const result = await pool.query(`
            SELECT v.*, 
                   c.nombre as cliente_nombre,
                   c.email as cliente_email,
                   json_agg(
                       json_build_object(
                           'id', dv.id,
                           'producto_id', dv.producto_id,
                           'nombre', p.nombre,
                           'cantidad', dv.cantidad,
                           'precio_unitario', dv.precio_unitario,
                           'subtotal', dv.subtotal
                       )
                   ) as items
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN detalle_venta dv ON v.id = dv.venta_id
            LEFT JOIN productos p ON dv.producto_id = p.id
            GROUP BY v.id, c.nombre, c.email
            ORDER BY v.fecha DESC
        `);

        console.log(`✅ ${result.rows.length} ventas encontradas`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error obteniendo ventas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas de ventas
app.get('/api/admin/ventas/stats', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas de ventas...');

        // Total de ventas hoy
        const hoy = await pool.query(`
            SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos
            FROM ventas 
            WHERE DATE(fecha) = CURRENT_DATE
        `);

        // Total de ventas esta semana
        const semana = await pool.query(`
            SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos
            FROM ventas 
            WHERE fecha >= DATE_TRUNC('week', CURRENT_DATE)
        `);

        // Total de ventas este mes
        const mes = await pool.query(`
            SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos
            FROM ventas 
            WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
        `);

        // Productos más vendidos
        const topProductos = await pool.query(`
            SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendido
            FROM detalle_venta dv
            JOIN productos p ON dv.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
            LIMIT 5
        `);

        console.log('✅ Estadísticas de ventas obtenidas');

        res.json({
            hoy: {
                total_ventas: parseInt(hoy.rows[0].total_ventas),
                total_ingresos: parseFloat(hoy.rows[0].total_ingresos)
            },
            semana: {
                total_ventas: parseInt(semana.rows[0].total_ventas),
                total_ingresos: parseFloat(semana.rows[0].total_ingresos)
            },
            mes: {
                total_ventas: parseInt(mes.rows[0].total_ventas),
                total_ingresos: parseFloat(mes.rows[0].total_ingresos)
            },
            topProductos: topProductos.rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas de ventas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`\n🚀 ==================================`);
    console.log(`✅ Servidor backend corriendo en http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔧 Diagnóstico: http://localhost:${port}/api/diagnostico`);
    console.log(`📦 Productos: http://localhost:${port}/api/productos`);
    console.log(`⭐ Destacados: http://localhost:${port}/api/productos/destacados`);
    console.log(`📁 Categorías: http://localhost:${port}/api/categorias`);
    console.log(`🔎 Búsqueda: http://localhost:${port}/api/buscar?q=procesador`);
    console.log(`💰 Ventas: http://localhost:${port}/api/ventas (POST)`);
    console.log(`🔐 Admin Login: http://localhost:${port}/api/admin/login (POST)`);
    console.log(`📊 Admin Stats: http://localhost:${port}/api/admin/stats`);
    console.log(`📈 Admin Ventas: http://localhost:${port}/api/admin/ventas`);
    console.log(`📉 Admin Ventas Stats: http://localhost:${port}/api/admin/ventas/stats`);
    console.log(`================================= 🚀\n`);
});