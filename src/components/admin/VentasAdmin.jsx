import React, { useState, useEffect } from 'react';
import { getVentas, getVentasStats } from '../../services/adminApi';
import './AdminStyles.css';

const VentasAdmin = () => {
    const [ventas, setVentas] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVenta, setSelectedVenta] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ventasData, statsData] = await Promise.all([
                getVentas(),
                getVentasStats()
            ]);
            setVentas(ventasData);
            setStats(statsData);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="admin-loading">Cargando ventas...</div>;
    }

    return (
        <div className="admin-ventas">
            <div className="admin-header">
                <h1>Gestión de Ventas</h1>
            </div>

            {stats && (
                <div className="ventas-stats">
                    <div className="stat-card">
                        <i className="fas fa-shopping-cart"></i>
                        <div className="stat-info">
                            <h3>Ventas Hoy</h3>
                            <p className="stat-number">{stats.hoy.total_ventas || 0}</p>
                            <p className="stat-sub">${parseFloat(stats.hoy.total_ingresos || 0).toLocaleString('es-MX')}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-calendar-week"></i>
                        <div className="stat-info">
                            <h3>Esta Semana</h3>
                            <p className="stat-number">{stats.semana.total_ventas || 0}</p>
                            <p className="stat-sub">${parseFloat(stats.semana.total_ingresos || 0).toLocaleString('es-MX')}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-calendar-alt"></i>
                        <div className="stat-info">
                            <h3>Este Mes</h3>
                            <p className="stat-number">{stats.mes.total_ventas || 0}</p>
                            <p className="stat-sub">${parseFloat(stats.mes.total_ingresos || 0).toLocaleString('es-MX')}</p>
                        </div>
                    </div>
                </div>
            )}

            {stats?.topProductos && stats.topProductos.length > 0 && (
                <div className="top-productos">
                    <h2>Productos Más Vendidos</h2>
                    <div className="top-productos-list">
                        {stats.topProductos.map((producto, index) => (
                            <div key={producto.id} className="top-producto-item">
                                <span className="top-rank">#{index + 1}</span>
                                <span className="top-nombre">{producto.nombre}</span>
                                <span className="top-cantidad">{producto.total_vendido} unidades</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {ventas.map(venta => (
                    <tr key={venta.id}>
                        <td>#{venta.id}</td>
                        <td>{formatDate(venta.fecha)}</td>
                        <td>{venta.cliente_nombre || 'Cliente Anónimo'}</td>
                        <td>
                            <button
                                className="btn-link"
                                onClick={() => setSelectedVenta(venta)}
                            >
                                Ver detalles ({venta.items?.length || 0} items)
                            </button>
                        </td>
                        <td>${parseFloat(venta.total).toLocaleString('es-MX')}</td>
                        <td>
                                <span className={`status-badge ${venta.estado}`}>
                                    {venta.estado}
                                </span>
                        </td>
                        <td>
                            <button
                                className="btn-icon view"
                                onClick={() => setSelectedVenta(venta)}
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {selectedVenta && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Detalle de Venta #{selectedVenta.id}</h2>

                        <div className="venta-info">
                            <p><strong>Fecha:</strong> {formatDate(selectedVenta.fecha)}</p>
                            <p><strong>Cliente:</strong> {selectedVenta.cliente_nombre || 'Cliente Anónimo'}</p>
                            {selectedVenta.cliente_email && (
                                <p><strong>Email:</strong> {selectedVenta.cliente_email}</p>
                            )}
                            <p><strong>Método de Pago:</strong> {selectedVenta.metodo_pago}</p>
                            <p><strong>Estado:</strong> {selectedVenta.estado}</p>
                        </div>

                        <h3>Productos</h3>
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedVenta.items?.map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>{item.cantidad}</td>
                                    <td>${parseFloat(item.precio_unitario).toLocaleString('es-MX')}</td>
                                    <td>${parseFloat(item.subtotal).toLocaleString('es-MX')}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
                                <td><strong>${parseFloat(selectedVenta.total).toLocaleString('es-MX')}</strong></td>
                            </tr>
                            </tfoot>
                        </table>

                        <div className="modal-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => setSelectedVenta(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VentasAdmin;