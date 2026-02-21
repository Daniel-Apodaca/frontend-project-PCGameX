import React, { useState, useEffect } from 'react';
import { getCategorias } from '../../services/api';
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/adminApi';
import './AdminStyles.css';

const CategoriasAdmin = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        icono: 'microchip'
    });

    const iconos = [
        'microchip', 'chess-board', 'memory', 'hdd', 'fan', 'keyboard', 'bolt', 'mouse', 'desktop'
    ];

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategoria) {
                await actualizarCategoria(editingCategoria.id, formData);
                alert('Categoría actualizada exitosamente');
            } else {
                await crearCategoria(formData);
                alert('Categoría creada exitosamente');
            }

            setShowModal(false);
            resetForm();
            loadCategorias();
        } catch (error) {
            alert('Error guardando categoría: ' + error.message);
        }
    };

    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setFormData({
            nombre: categoria.nombre || '',
            descripcion: categoria.descripcion || '',
            icono: categoria.icono || 'microchip'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await eliminarCategoria(id);
                alert('Categoría eliminada');
                loadCategorias();
            } catch (error) {
                alert('Error eliminando categoría: ' + error.message);
            }
        }
    };

    const resetForm = () => {
        setEditingCategoria(null);
        setFormData({
            nombre: '',
            descripcion: '',
            icono: 'microchip'
        });
    };

    if (loading) return <div className="admin-loading">Cargando categorías...</div>;

    return (
        <div className="admin-products">
            <div className="admin-header">
                <h1>Gestión de Categorías</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <i className="fas fa-plus"></i> Nueva Categoría
                </button>
            </div>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Icono</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {categorias.map(categoria => (
                    <tr key={categoria.id}>
                        <td>{categoria.id}</td>
                        <td>
                            <i className={`fas fa-${categoria.icono || 'microchip'}`}
                               style={{ fontSize: '1.5rem', color: 'var(--highlight-color)' }}></i>
                        </td>
                        <td>{categoria.nombre}</td>
                        <td>{categoria.descripcion}</td>
                        <td>
                                <span className="stock-badge ok">
                                    {categoria.total_productos} productos
                                </span>
                        </td>
                        <td>
                            <button
                                className="btn-icon edit"
                                onClick={() => handleEdit(categoria)}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button
                                className="btn-icon delete"
                                onClick={() => handleDelete(categoria.id)}
                                disabled={categoria.total_productos > 0}
                                title={categoria.total_productos > 0 ?
                                    'No se puede eliminar categoría con productos' : ''}
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
                        <h2>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
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

                            <div className="form-group">
                                <label>Icono:</label>
                                <select
                                    name="icono"
                                    value={formData.icono}
                                    onChange={handleInputChange}
                                >
                                    {iconos.map(icono => (
                                        <option key={icono} value={icono}>
                                            {icono}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <i className={`fas fa-${formData.icono}`}
                                       style={{ fontSize: '2rem', color: 'var(--highlight-color)' }}></i>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingCategoria ? 'Actualizar' : 'Guardar'}
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

export default CategoriasAdmin;