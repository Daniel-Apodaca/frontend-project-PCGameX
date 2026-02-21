import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/adminApi';
import './AdminStyles.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Cargando dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <i className="fas fa-box"></i>
                    <div className="stat-info">
                        <h3>Total Productos</h3>
                        <p className="stat-number">{stats?.totalProductos || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fas fa-tags"></i>
                    <div className="stat-info">
                        <h3>Categorías</h3>
                        <p className="stat-number">{stats?.totalCategorias || 0}</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div className="stat-info">
                        <h3>Stock Bajo</h3>
                        <p className="stat-number">{stats?.stockBajo || 0}</p>
                    </div>
                </div>

                <div className="stat-card danger">
                    <i className="fas fa-times-circle"></i>
                    <div className="stat-info">
                        <h3>Agotados</h3>
                        <p className="stat-number">{stats?.agotados || 0}</p>
                    </div>
                </div>

                <div className="stat-card success">
                    <i className="fas fa-star"></i>
                    <div className="stat-info">
                        <h3>Destacados</h3>
                        <p className="stat-number">{stats?.destacados || 0}</p>
                    </div>
                </div>
            </div>

            <div className="recent-products">
                <h2>Últimos Productos Agregados</h2>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Fecha</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stats?.ultimosProductos?.map(producto => (
                        <tr key={producto.id}>
                            <td>{producto.id}</td>
                            <td>{producto.nombre}</td>
                            <td>${producto.precio.toLocaleString('es-MX')}</td>
                            <td>
                                    <span className={`stock-badge ${producto.stock === 0 ? 'out' : producto.stock < 5 ? 'low' : 'ok'}`}>
                                        {producto.stock}
                                    </span>
                            </td>
                            <td>{new Date(producto.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;