import React from 'react';

const ProductCard = ({ product, addToCart }) => {
    const { id, nombre, precio, descuento, imagen_url, stock } = product;
    const finalPrice = descuento ? precio * (1 - descuento / 100) : precio;
    const imageUrl = imagen_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea';

    const handleAddToCart = () => {
        if (!addToCart) {
            console.error('❌ addToCart no está definido en ProductCard');
            alert('Error: Función de carrito no disponible');
            return;
        }

        const productoParaCarrito = {
            id: id,
            nombre: nombre,
            precio: precio,
            descuento: descuento || 0,
            imagen_url: imageUrl,
            stock: stock || 10,
            cantidad: 1
        };

        console.log('✅ Enviando al carrito:', productoParaCarrito);
        addToCart(productoParaCarrito);
    };

    return (
        <div className="product-card">
            {descuento > 0 && (
                <div className="product-badge">
                    <span className="discount-badge">-{descuento}%</span>
                </div>
            )}

            <div className="product-image">
                <img src={imageUrl} alt={nombre} />
            </div>

            <div className="product-info">
                <h3 className="product-name">{nombre}</h3>

                <div className="product-price">
                    {descuento > 0 ? (
                        <>
                            <span className="original-price">${precio.toLocaleString('es-MX')}</span>
                            <span className="final-price">${finalPrice.toLocaleString('es-MX')}</span>
                        </>
                    ) : (
                        <span className="final-price">${precio.toLocaleString('es-MX')}</span>
                    )}
                </div>

                <button
                    className="btn"
                    disabled={stock === 0}
                    onClick={handleAddToCart}
                >
                    {stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;