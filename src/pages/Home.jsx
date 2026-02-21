import React, { useState, useEffect } from 'react';
import { getProductosDestacados, getCategorias } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productosData, categoriasData] = await Promise.all([
                    getProductosDestacados(),
                    getCategorias()
                ]);
                setProducts(productosData);
                setCategorias(categoriasData);
                setError(null);
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError('Error al cargar los productos. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <main>
            <section className="hero-banner">
                <div className="container">
                    <div className="hero-text">
                        <h2>Construye tu PC Gaming Soñado</h2>
                        <p>Los mejores componentes al mejor precio. Envío a todo México.</p>
                        <div className="hero-buttons">
                            <a href="/products" className="btn">Ver Productos</a>
                            <a href="/products" className="btn btn-outline">Ofertas Especiales</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="featured-products">
                <div className="container">
                    <h2 className="section-title">Productos Destacados</h2>

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
                        <p className="no-products">No hay productos destacados disponibles</p>
                    )}

                    <div style={{ textAlign: 'center' }}>
                        <a href="/products" className="btn">Ver Todos los Productos</a>
                    </div>
                </div>
            </section>

            <section className="categories">
                <div className="container">
                    <h2 className="section-title">Categorías</h2>

                    <div className="categories-grid">
                        {categorias.map((categoria) => (
                            <a
                                key={categoria.id}
                                href={`/products?category=${categoria.nombre.toLowerCase()}`}
                                className="category-card"
                            >
                                <i className={`fas fa-${categoria.icono || 'microchip'}`}></i>
                                <h3>{categoria.nombre}</h3>
                                <p>{categoria.total_productos} productos</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;