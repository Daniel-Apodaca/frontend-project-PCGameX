import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAdminToken, getAdminToken } from '../../services/adminApi';
import Dashboard from '../../components/admin/Dashboard';
import ProductosAdmin from '../../components/admin/ProductosAdmin';
import CategoriasAdmin from '../../components/admin/CategoriasAdmin';
import VentasAdmin from '../../components/admin/VentasAdmin';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin/login');
        }

        const path = location.pathname.split('/')[2];
        if (path) {
            setActiveTab(path);
        }
    }, [location, navigate]);

    const handleLogout = () => {
        clearAdminToken();
        navigate('/admin/login');
    };

    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <h2>PCgameX Admin</h2>
                <ul>
                    <li>
                        <Link to="/admin/dashboard" className={activeTab === 'dashboard' ? 'active' : ''}>
                            <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/productos" className={activeTab === 'productos' ? 'active' : ''}>
                            <i className="fas fa-box"></i> Productos
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/categorias" className={activeTab === 'categorias' ? 'active' : ''}>
                            <i className="fas fa-tags"></i> Categorías
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/ventas" className={activeTab === 'ventas' ? 'active' : ''}>
                            <i className="fas fa-shopping-cart"></i> Ventas
                        </Link>
                    </li>
                    <li className="logout">
                        <button onClick={handleLogout} style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '10px 15px',
                            width: '100%',
                            textAlign: 'left'
                        }}>
                            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>

            <div className="admin-content">
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="productos" element={<ProductosAdmin />} />
                    <Route path="categorias" element={<CategoriasAdmin />} />
                    <Route path="ventas" element={<VentasAdmin />} />
                    <Route path="*" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPanel;