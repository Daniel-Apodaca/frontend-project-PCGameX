import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { getCategorias, buscarProductos } from './services/api';

// Importar páginas de cliente
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';

// Importar componentes de administración
import AdminLogin from './pages/Admin/AdminLogin';
import AdminPanel from './pages/Admin/AdminPanel';

// Componente Header actualizado con búsqueda funcional
const Header = ({ cartCount }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 2) {
            try {
                const results = await buscarProductos(value);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                console.error('Error en búsqueda:', error);
            }
        } else {
            setShowResults(false);
        }
    };

    return (
        <header className="header">
            <div className="container header-content">
                <div className="logo">
                    <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1>PCgameX</h1>
                        <p className="tagline">Hardware Gaming de Alto Rendimiento</p>
                    </a>
                </div>

                <div className="header-actions">
                    <div className="search-container">
                        <form className="search-bar" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                onFocus={() => searchTerm.length > 2 && setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            />
                            <button type="submit" className="search-btn">
                                <i className="fas fa-search"></i>
                            </button>
                        </form>

                        {showResults && searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(product => (
                                    <a
                                        key={product.id}
                                        href={`/products?search=${encodeURIComponent(product.nombre)}`}
                                        className="search-result-item"
                                        onClick={() => setShowResults(false)}
                                    >
                                        <img src={product.imagen_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea'} alt={product.nombre} />
                                        <div>
                                            <h4>{product.nombre}</h4>
                                            <p>${parseFloat(product.precio).toLocaleString('es-MX')}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="user-actions">
                        <a href="/login" className="user-icon">
                            <i className="fas fa-user"></i>
                            <span>Mi cuenta</span>
                        </a>
                        <a href="/cart" className="cart-icon">
                            <i className="fas fa-shopping-cart"></i>
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Componente Navbar actualizado
const Navbar = ({ categorias = [] }) => {
    const categories = [
        { name: 'Inicio', path: '/' },
        {
            name: 'Componentes',
            subcategories: categorias
                .filter(c => [1,2,3,4].includes(c.id))
                .map(c => c.nombre)
        },
        { name: 'Computadoras', subcategories: ['PC Gaming', 'Workstations', 'PC Oficina'] },
        {
            name: 'Periféricos',
            subcategories: categorias
                .filter(c => [7].includes(c.id))
                .map(c => c.nombre)
        },
        {
            name: 'Almacenamiento',
            subcategories: categorias
                .filter(c => [5].includes(c.id))
                .map(c => c.nombre)
        },
        {
            name: 'Refrigeración',
            subcategories: categorias
                .filter(c => [6].includes(c.id))
                .map(c => c.nombre)
        },
        { name: 'Ofertas', path: '/products' },
        { name: 'Admin', path: '/admin/login' },
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <ul className="nav-menu">
                    {categories.map((category, index) => (
                        <li key={index} className="nav-item">
                            {category.path ? (
                                <a href={category.path}>{category.name}</a>
                            ) : (
                                <div className="dropdown">
                                    <a href="#!" className="dropdown-toggle">
                                        {category.name} <i className="fas fa-chevron-down"></i>
                                    </a>
                                    <div className="dropdown-menu">
                                        {category.subcategories.map((sub, subIndex) => (
                                            <a key={subIndex} href={`/products?category=${encodeURIComponent(sub.toLowerCase())}`}>
                                                {sub}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

// Componente Footer actualizado
const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>PCgameX</h3>
                    <p>Venta de hardware y componentes de computadora de alta calidad para gaming y productividad.</p>
                    <div className="social-links">
                        <a href="#!"><i className="fab fa-facebook"></i></a>
                        <a href="#!"><i className="fab fa-twitter"></i></a>
                        <a href="#!"><i className="fab fa-instagram"></i></a>
                        <a href="#!"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="/products">Productos</a></li>
                        <li><a href="/cart">Carrito</a></li>
                        <li><a href="/admin/login">Panel Admin</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Categorías</h4>
                    <ul>
                        <li><a href="/products?category=procesadores">Procesadores</a></li>
                        <li><a href="/products?category=tarjetas%20gr%C3%A1ficas">Tarjetas Gráficas</a></li>
                        <li><a href="/products?category=memoria%20ram">Memoria RAM</a></li>
                        <li><a href="/products?category=almacenamiento">Almacenamiento</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contacto</h4>
                    <ul className="contact-info">
                        <li><i className="fas fa-map-marker-alt"></i> Tijuana, B.C.</li>
                        <li><i className="fas fa-phone"></i> 664-715-6264</li>
                        <li><i className="fas fa-envelope"></i> info@pcgamex.com.mx</li>
                        <li><i className="fas fa-clock"></i> Lunes a Viernes: 9am - 7pm</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} PCgameX. Todos los derechos reservados.</p>
                <div className="payment-methods">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                    <i className="fab fa-cc-amex"></i>
                    <i className="fab fa-cc-paypal"></i>
                </div>
            </div>
        </div>
    </footer>
);

function App() {
    const [categorias, setCategorias] = useState([]);
    const [cart, setCart] = useState([]);

    // Cargar categorías
    useEffect(() => {
        let isMounted = true;

        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                if (isMounted) {
                    setCategorias(data);
                }
            } catch (error) {
                console.error('Error cargando categorías:', error);
            }
        };

        fetchCategorias();

        return () => {
            isMounted = false;
        };
    }, []);

    // Cargar carrito del localStorage UNA SOLA VEZ al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                console.log('🔄 Cargando carrito de localStorage:', parsedCart);
                setCart(parsedCart);
            } catch (e) {
                console.error('Error cargando carrito:', e);
            }
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('💾 Guardando carrito en localStorage:', cart);
            localStorage.setItem('cart', JSON.stringify(cart));
        }, 0);

        return () => clearTimeout(timer);
    }, [cart]);

    // Funciones del carrito - MEMOIZADAS con useCallback
    const addToCart = useCallback((product) => {
        console.log('📦 Recibido para agregar al carrito:', product);

        if (!product || !product.id) {
            console.error('❌ Producto inválido:', product);
            alert('Error: Producto inválido');
            return;
        }

        setCart(currentCart => {
            console.log('🛒 Carrito actual antes:', currentCart);

            const existingItem = currentCart.find(item => item.id === product.id);

            let newCart;
            if (existingItem) {
                newCart = currentCart.map(item =>
                    item.id === product.id
                        ? { ...item, cantidad: (item.cantidad || 1) + 1 }
                        : item
                );
                console.log('➕ Producto existente, cantidad aumentada');
            } else {
                const nuevoProducto = {
                    id: product.id,
                    nombre: product.nombre,
                    precio: Number(product.precio),
                    descuento: product.descuento || 0,
                    imagen_url: product.imagen_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea',
                    stock: product.stock || 10,
                    cantidad: 1
                };
                newCart = [...currentCart, nuevoProducto];
                console.log('🆕 Nuevo producto agregado:', nuevoProducto);
            }

            console.log('✅ Nuevo carrito:', newCart);
            return newCart;
        });

        alert(`✅ ${product.nombre} agregado al carrito`);
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart(currentCart => {
            const newCart = currentCart.filter(item => item.id !== productId);
            alert('🗑️ Producto eliminado del carrito');
            return newCart;
        });
    }, []);

    const updateQuantity = useCallback((productId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(currentCart =>
            currentCart.map(item =>
                item.id === productId
                    ? { ...item, cantidad: newQuantity }
                    : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        alert('🛒 Carrito vaciado');
    }, []);

    const cartCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Rutas de administración */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/*" element={<AdminPanel />} />

                    {/* Rutas públicas */}
                    <Route path="/*" element={
                        <>
                            <Header cartCount={cartCount} />
                            <Navbar categorias={categorias} />
                            <Routes>
                                <Route path="/" element={<Home addToCart={addToCart} />} />
                                <Route path="/products" element={<Products addToCart={addToCart} />} />
                                <Route path="/cart" element={
                                    <Cart
                                        cart={cart}
                                        removeFromCart={removeFromCart}
                                        updateQuantity={updateQuantity}
                                        clearCart={clearCart}
                                    />
                                } />
                                {/* Rutas temporales */}
                                <Route path="/about" element={<Home addToCart={addToCart} />} />
                                <Route path="/login" element={<Home addToCart={addToCart} />} />
                            </Routes>
                            <Footer />
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;