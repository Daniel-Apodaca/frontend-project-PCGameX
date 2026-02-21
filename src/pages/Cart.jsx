import React, { useState } from 'react';
import { crearVenta } from '../services/api';

const Cart = ({ cart, removeFromCart, updateQuantity, clearCart }) => {
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Calcular total
    const total = cart.reduce((sum, item) => {
        const precioFinal = item.descuento && item.descuento > 0
            ? item.precio * (1 - item.descuento / 100)
            : item.precio;
        return sum + (precioFinal * (item.cantidad || 1));
    }, 0);

    const handleCheckout = () => {
        setShowCheckout(true);
    };

    const confirmCheckout = async () => {
        setProcessing(true);
        setError(null);

        try {
            // Preparar datos de la venta
            const ventaData = {
                items: cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio: item.descuento > 0
                        ? item.precio * (1 - item.descuento / 100)
                        : item.precio
                })),
                total: total,
                metodo_pago: 'efectivo',
                cliente: {
                    id: null, // Cliente anónimo por ahora
                    nombre: 'Cliente Anónimo'
                }
            };

            console.log('Procesando venta:', ventaData);

            // Enviar venta al backend
            const result = await crearVenta(ventaData);

            if (result.success) {
                setCheckoutSuccess(true);
                setTimeout(() => {
                    setCheckoutSuccess(false);
                    setShowCheckout(false);
                    clearCart();
                }, 3000);
            } else {
                throw new Error(result.error || 'Error al procesar la venta');
            }
        } catch (err) {
            console.error('Error en checkout:', err);
            setError(err.message || 'Error al procesar la compra. Intenta de nuevo.');
        } finally {
            setProcessing(false);
        }
    };

    // Verificar stock antes de mostrar checkout
    const verificarStock = () => {
        const sinStock = cart.filter(item => item.cantidad > item.stock);
        if (sinStock.length > 0) {
            return `No hay suficiente stock para: ${sinStock.map(i => i.nombre).join(', ')}`;
        }
        return null;
    };

    const stockError = verificarStock();

    if (checkoutSuccess) {
        return (
            <main className="cart-page">
                <div className="container">
                    <div className="checkout-success">
                        <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#27ae60' }}></i>
                        <h2>¡Compra Exitosa!</h2>
                        <p>Tu pedido ha sido procesado correctamente.</p>
                        <p>Gracias por comprar en PCgameX</p>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                            Los productos se descontarán del stock automáticamente
                        </p>
                        <a href="/" className="btn" style={{ marginTop: '20px' }}>Volver al Inicio</a>
                    </div>
                </div>
            </main>
        );
    }

    // Si no hay carrito o está vacío
    if (!cart || cart.length === 0) {
        return (
            <main className="cart-page">
                <div className="container">
                    <h1 className="section-title">Carrito de Compras</h1>
                    <div className="empty-cart">
                        <i className="fas fa-shopping-cart" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                        <h3>Tu carrito está vacío</h3>
                        <p>Agrega algunos productos para continuar</p>
                        <a href="/products" className="btn">Ver Productos</a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <h1 className="section-title">Carrito de Compras</h1>

                {error && (
                    <div className="error-message" style={{
                        background: '#fee',
                        color: '#e74c3c',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}

                {stockError && (
                    <div className="error-message" style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <i className="fas fa-exclamation-triangle"></i> {stockError}
                    </div>
                )}

                <div className="cart-items">
                    {cart.map(item => {
                        const precioFinal = item.descuento && item.descuento > 0
                            ? item.precio * (1 - item.descuento / 100)
                            : item.precio;

                        return (
                            <div key={item.id} className="cart-item">
                                <img
                                    src={item.imagen_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea'}
                                    alt={item.nombre}
                                />
                                <div className="cart-item-info">
                                    <h3>{item.nombre}</h3>
                                    <p className="cart-item-price">
                                        ${precioFinal.toLocaleString('es-MX')} c/u
                                    </p>
                                    <p className="cart-item-stock" style={{ fontSize: '0.85rem', color: item.stock < 5 ? '#e74c3c' : '#27ae60' }}>
                                        Stock disponible: {item.stock}
                                    </p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button
                                        onClick={() => updateQuantity(item.id, (item.cantidad || 1) - 1)}
                                        disabled={(item.cantidad || 1) <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.cantidad || 1}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, (item.cantidad || 1) + 1)}
                                        disabled={(item.cantidad || 1) >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="cart-item-subtotal">
                                    <p>Subtotal:</p>
                                    <strong>${(precioFinal * (item.cantidad || 1)).toLocaleString('es-MX')}</strong>
                                </div>
                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="cart-summary">
                    <h3>Resumen de Compra</h3>
                    <div className="cart-total">
                        <span>Total:</span>
                        <strong>${total.toLocaleString('es-MX')}</strong>
                    </div>

                    {!showCheckout ? (
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleCheckout}
                            disabled={!!stockError || cart.length === 0}
                        >
                            Proceder al Pago
                        </button>
                    ) : (
                        <div className="checkout-form">
                            <h4>Confirmar Compra</h4>
                            <p>Total a pagar: <strong>${total.toLocaleString('es-MX')}</strong></p>
                            <div className="checkout-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={confirmCheckout}
                                    disabled={processing}
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Compra'}
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowCheckout(false)}
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Cart;