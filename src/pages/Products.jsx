import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProductos, getCategorias, buscarProductos } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('category');
        const search = params.get('search');

        if (cat) {
            setCategoriaSeleccionada(cat);
            setSearchTerm('');
        }

        if (search) {
            setSearchTerm(search);
            setCategoriaSeleccionada('todas');
        }
    }, [location]);

    useEffect(() => {
        loadData();
    }, [categoriaSeleccionada, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);

            let productosData;

            // Si hay término de búsqueda, usar endpoint de búsqueda
            if (searchTerm) {
                productosData = await buscarProductos(searchTerm);
                setProducts(productosData);

                // Cargar categorías por separado
                const categoriasData = await getCategorias();
                setCategorias(categoriasData);
            } else {
                // Carga normal por categoría
                const [productosData, categoriasData] = await Promise.all([
                    getProductos(),
                    getCategorias()
                ]);

                let productosFiltrados = productosData;
                if (categoriaSeleccionada !== 'todas') {
                    const categoria = categoriasData.find(c =>
                        c.nombre.toLowerCase() === categoriaSeleccionada.toLowerCase()
                    );
                    if (categoria) {
                        productosFiltrados = productosData.filter(p =>
                            p.categoria_id === categoria.id
                        );
                    }
                }

                setProducts(productosFiltrados);
                setCategorias(categoriasData);
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        );
    }

    return (
        <main className="products-page">
            <div className="container">
                <h1 className="section-title">
                    {searchTerm ? `Resultados para: "${searchTerm}"` : 'Todos los Productos'}
                </h1>

                {!searchTerm && (
                    <div className="category-filter">
                        <button
                            className={`filter-btn ${categoriaSeleccionada === 'todas' ? 'active' : ''}`}
                            onClick={() => setCategoriaSeleccionada('todas')}
                        >
                            Todos
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${categoriaSeleccionada === cat.nombre.toLowerCase() ? 'active' : ''}`}
                                onClick={() => {
                                    setCategoriaSeleccionada(cat.nombre.toLowerCase());
                                    setSearchTerm('');
                                }}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                )}

                {products.length > 0 ? (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-products">
                        <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <p>No hay productos en esta categoría</p>
                        {searchTerm && (
                            <a href="/products" className="btn" style={{ marginTop: '20px' }}>
                                Ver todos los productos
                            </a>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Products;