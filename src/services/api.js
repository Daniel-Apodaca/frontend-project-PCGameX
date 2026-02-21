import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Productos
export const getProductos = async (params = {}) => {
    try {
        const response = await api.get('/productos', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching productos:', error);
        throw error;
    }
};

export const getProductosDestacados = async () => {
    try {
        const response = await api.get('/productos/destacados');
        return response.data;
    } catch (error) {
        console.error('Error fetching productos destacados:', error);
        throw error;
    }
};

export const getProductoById = async (id) => {
    try {
        const response = await api.get(`/productos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching producto:', error);
        throw error;
    }
};

// Búsqueda
export const buscarProductos = async (termino) => {
    try {
        const response = await api.get('/buscar', { params: { q: termino } });
        return response.data;
    } catch (error) {
        console.error('Error buscando productos:', error);
        throw error;
    }
};

// Categorías
export const getCategorias = async () => {
    try {
        const response = await api.get('/categorias');
        return response.data;
    } catch (error) {
        console.error('Error fetching categorias:', error);
        throw error;
    }
};

export const getProductosByCategoria = async (categoriaId) => {
    try {
        const response = await api.get(`/categorias/${categoriaId}/productos`);
        return response.data;
    } catch (error) {
        console.error('Error fetching productos por categoria:', error);
        throw error;
    }
};

// Ventas
export const crearVenta = async (ventaData) => {
    try {
        const response = await api.post('/ventas', ventaData);
        return response.data;
    } catch (error) {
        console.error('Error creando venta:', error);
        throw error;
    }
};

// Health check
export const checkHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Error checking health:', error);
        throw error;
    }
};

export default api;