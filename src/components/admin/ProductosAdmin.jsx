import React, { useState, useEffect } from 'react';
import { getProductos, getCategorias } from '../../services/api';
import { crearProducto, actualizarProducto, eliminarProducto } from '../../services/adminApi';
import './AdminStyles.css';

const ProductosAdmin = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        precio_anterior: '',
        stock: '',
        categoria_id: '',
        imagen_url: '',
        marca: '',
        destacado: false,
        descuento: '0'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productosData, categoriasData] = await Promise.all([
                getProductos(),
                getCategorias()
            ]);
            setProductos(productosData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productoData = {
                ...formData,
                precio: parseFloat(formData.precio),
                precio_anterior: formData.precio_anterior ? parseFloat(formData.precio_anterior) : null,
                stock: parseInt(formData.stock),
                descuento: parseInt(formData.descuento),
                categoria_id: parseInt(formData.categoria_id)
            };

            if (editingProduct) {
                await actualizarProducto(editingProduct.id, productoData);
                alert('Producto actualizado exitosamente');
            } else {
                await crearProducto(productoData);
                alert('Producto creado exitosamente');
            }

            setShowModal(false);
            resetForm();
            loadData();
        } catch (error) {
            alert('Error guardando producto: ' + error.message);
        }
    };

    const handleEdit = (producto) => {
        setEditingProduct(producto);
        setFormData({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: producto.precio || '',
            precio_anterior: producto.precio_anterior || '',
            stock: producto.stock || '',
            categoria_id: producto.categoria_id || '',
            imagen_url: producto.imagen_url || '',
            marca: producto.marca || '',
            destacado: producto.destacado || false,
            descuento: producto.descuento || '0'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await eliminarProducto(id);
                alert('Producto eliminado');
                loadData();
            } catch (error) {
                alert('Error eliminando producto: ' + error.message);
            }
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            precio_anterior: '',
            stock: '',
            categoria_id: '',
            imagen_url: '',
            marca: '',
            destacado: false,
            descuento: '0'
        });
    };

    if (loading) return <div className="admin-loading">Cargando productos...</div>;

    return (
        <div className="admin-products">
            <div className="admin-header">
                <h1>Gestión de Productos</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <i className="fas fa-plus"></i> Nuevo Producto
                </button>
            </div>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Destacado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {productos.map(producto => (
                    <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>
                            <img
                                src={producto.imagen_url || 'https://via.placeholder.com/50'}
                                alt={producto.nombre}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                        </td>
                        <td>{producto.nombre}</td>
                        <td>{producto.categoria_nombre}</td>
                        <td>${producto.precio.toLocaleString('es-MX')}</td>
                        <td>
                                <span className={`stock-badge ${producto.stock === 0 ? 'out' : producto.stock < 5 ? 'low' : 'ok'}`}>
                                    {producto.stock}
                                </span>
                        </td>
                        <td>
                            {producto.destacado ?
                                <i className="fas fa-star" style={{ color: '#e94560' }}></i> :
                                <i className="far fa-star"></i>
                            }
                        </td>
                        <td>
                            <button
                                className="btn-icon edit"
                                onClick={() => handleEdit(producto)}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button
                                className="btn-icon delete"
                                onClick={() => handleDelete(producto.id)}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio:</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Precio Anterior:</label>
                                    <input
                                        type="number"
                                        name="precio_anterior"
                                        value={formData.precio_anterior}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock:</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descuento %:</label>
                                    <input
                                        type="number"
                                        name="descuento"
                                        value={formData.descuento}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Categoría:</label>
                                <select
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Marca:</label>
                                <input
                                    type="text"
                                    name="marca"
                                    value={formData.marca}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>URL de Imagen:</label>
                                <input
                                    type="text"
                                    name="imagen_url"
                                    value={formData.imagen_url}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="destacado"
                                        checked={formData.destacado}
                                        onChange={handleInputChange}
                                    />
                                    Producto Destacado
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductosAdmin;