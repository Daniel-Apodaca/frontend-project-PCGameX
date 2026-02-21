import axios from 'axios';

const API_URL = 'http://localhost:3001/api/admin';

let adminToken = null;

export const setAdminToken = (token) => {
    adminToken = token;
    localStorage.setItem('adminToken', token);
};

export const getAdminToken = () => {
    return adminToken || localStorage.getItem('adminToken');
};

export const clearAdminToken = () => {
    adminToken = null;
    localStorage.removeItem('adminToken');
};

const adminApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

adminApi.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) {
        config.headers['admin-token'] = token;
    }
    return config;
});

// Login
export const adminLogin = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password
        });
        if (response.data.success) {
            setAdminToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

// Productos
export const crearProducto = async (producto) => {
    try {
        const response = await adminApi.post('/productos', producto);
        return response.data;
    } catch (error) {
        console.error('Error creando producto:', error);
        throw error;
    }
};

export const actualizarProducto = async (id, producto) => {
    try {
        const response = await adminApi.put(`/productos/${id}`, producto);
        return response.data;
    } catch (error) {
        console.error('Error actualizando producto:', error);
        throw error;
    }
};

export const eliminarProducto = async (id) => {
    try {
        const response = await adminApi.delete(`/productos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error eliminando producto:', error);
        throw error;
    }
};

// Categorías
export const crearCategoria = async (categoria) => {
    try {
        const response = await adminApi.post('/categorias', categoria);
        return response.data;
    } catch (error) {
        console.error('Error creando categoría:', error);
        throw error;
    }
};

export const actualizarCategoria = async (id, categoria) => {
    try {
        const response = await adminApi.put(`/categorias/${id}`, categoria);
        return response.data;
    } catch (error) {
        console.error('Error actualizando categoría:', error);
        throw error;
    }
};

export const eliminarCategoria = async (id) => {
    try {
        const response = await adminApi.delete(`/categorias/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        throw error;
    }
};

// Estadísticas
export const getAdminStats = async () => {
    try {
        const response = await adminApi.get('/stats');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        throw error;
    }
};

// Ventas (nuevo)
export const getVentas = async () => {
    try {
        const response = await adminApi.get('/ventas');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo ventas:', error);
        throw error;
    }
};

export const getVentasStats = async () => {
    try {
        const response = await adminApi.get('/ventas/stats');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas de ventas:', error);
        throw error;
    }
};

export default adminApi;