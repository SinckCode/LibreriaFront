import React, { useEffect, useState, useMemo } from "react";
import "../styles/CatalogPage.css";

function CatalogPage() {
  const [libros, setLibros] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibro, setSelectedLibro] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLibroId, setEditLibroId] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  const [nuevoLibro, setNuevoLibro] = useState({
    titulo: "",
    autor: "",
    anio: "",
    categoria: "",
    paginas: "",
    imagen: "",
    sinopsis: ""
  });

  const fetchLibros = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://104.248.118.8/libros", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLibros(data);
    } catch (error) {
      console.error("Error al obtener libros:", error);
    }
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  const categorias = useMemo(() => ["Todas", ...new Set(libros.map(libro => libro.categoria).filter(Boolean))], [libros]);

  const filteredLibros = libros.filter((libro) => {
    const titulo = libro.titulo || "";
    const autor = libro.autor || "";
    const id = String(libro.id || "");
    const categoria = libro.categoria || "";

    const coincideBusqueda =
      titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm);

    const coincideCategoria =
      categoriaSeleccionada === "Todas" || categoria === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  const closeModal = () => setSelectedLibro(null);
  const closeAdminModal = () => {
    setAdminModal(false);
    setEditMode(false);
    setNuevoLibro({
      titulo: "",
      autor: "",
      anio: "",
      categoria: "",
      paginas: "",
      imagen: "",
      sinopsis: ""
    });
  };

  const handleCreateOrEditLibro = async (e) => {
    e.preventDefault();

    const { titulo, autor, anio, categoria, paginas, imagen, sinopsis } = nuevoLibro;
    if (!titulo || !autor || !anio || !categoria || !paginas || !imagen || !sinopsis) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const anioInt = parseInt(anio);
    const paginasInt = parseInt(paginas);
    if (isNaN(anioInt) || anioInt < 0) {
      alert("El año debe ser un número válido.");
      return;
    }
    if (isNaN(paginasInt) || paginasInt <= 0) {
      alert("Las páginas deben ser un número positivo.");
      return;
    }

    const libroAEnviar = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      anio: anioInt,
      categoria: categoria.trim(),
      paginas: paginasInt,
      imagen: imagen.trim(),
      sinopsis: sinopsis.trim(),
    };

    const token = localStorage.getItem("token");
    const url = editMode
      ? `https://104.248.118.8/libros/${editLibroId}`
      : "https://104.248.118.8/libros";
    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(libroAEnviar),
      });
      if (response.ok) {
        await fetchLibros();
        closeAdminModal();
        alert(editMode ? "Libro actualizado" : "Libro creado exitosamente");
      } else {
        const errorData = await response.json();
        alert("Error al guardar libro:\n" + JSON.stringify(errorData.detail));
      }
    } catch (error) {
      alert("Error al guardar libro");
      console.error(error);
    }
  };

  const handleEdit = (libro) => {
    setEditMode(true);
    setEditLibroId(libro.id);
    setNuevoLibro(libro);
    setAdminModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este libro?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://104.248.118.8/libros/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchLibros();
        alert("Libro eliminado");
      } else {
        alert("Error al eliminar libro");
      }
    } catch (error) {
      console.error("Error eliminando libro:", error);
      alert("Error en la conexión");
    }
  };

  return (
    <div className="catalog-container">
      <h1 className="catalog-title">Catálogo de Libros</h1>

      <div className="catalog-toolbar">
        <input
          type="text"
          placeholder="Buscar por título, autor o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="catalog-search"
        />

        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="catalog-search"
        >
          {categorias.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={showAdmin}
            onChange={() => setShowAdmin(!showAdmin)}
          />
          Modo admin
        </label>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {showAdmin && (
        <button className="admin-add-button" onClick={() => setAdminModal(true)}>
          + Agregar libro
        </button>
      )}

      <div className="catalog-grid">
        {filteredLibros.map((libro) => (
          <div
            key={libro.id}
            className="catalog-card"
            onClick={() => setSelectedLibro(libro)}
          >
            <img
              src={libro.imagen || "https://m.media-amazon.com/images/I/61DLxPmWdbL._SL1500_.jpg"}
              alt={libro.titulo}
              className="catalog-image"
            />
            <div className="catalog-info">
              <strong>{libro.titulo}</strong>
              <p>{libro.autor}</p>
              {showAdmin && (
                <div className="admin-buttons">
                  <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEdit(libro); }}>Editar</button>
                  <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(libro.id); }}>Borrar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLibro && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <img src={selectedLibro.imagen} alt={selectedLibro.titulo} className="modal-image" />
            <h2>{selectedLibro.titulo}</h2>
            <p><strong>Autor:</strong> {selectedLibro.autor}</p>
            <p><strong>Año:</strong> {selectedLibro.anio}</p>
            <p><strong>Categoría:</strong> {selectedLibro.categoria}</p>
            <p><strong>Páginas:</strong> {selectedLibro.paginas}</p>
            <p><strong>Sinopsis:</strong> {selectedLibro.sinopsis}</p>
          </div>
        </div>
      )}

      {adminModal && (
        <div className="modal-overlay" onClick={closeAdminModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAdminModal}>&times;</button>
            <h2>{editMode ? "Editar libro" : "Agregar nuevo libro"}</h2>
            <form onSubmit={handleCreateOrEditLibro} className="admin-form">
              <input type="text" placeholder="Título" value={nuevoLibro.titulo} onChange={(e) => setNuevoLibro({ ...nuevoLibro, titulo: e.target.value })} required />
              <input type="text" placeholder="Autor" value={nuevoLibro.autor} onChange={(e) => setNuevoLibro({ ...nuevoLibro, autor: e.target.value })} required />
              <input type="number" placeholder="Año" value={nuevoLibro.anio} onChange={(e) => setNuevoLibro({ ...nuevoLibro, anio: e.target.value })} required />
              <input type="text" placeholder="Categoría" value={nuevoLibro.categoria} onChange={(e) => setNuevoLibro({ ...nuevoLibro, categoria: e.target.value })} required />
              <input type="number" placeholder="Páginas" value={nuevoLibro.paginas} onChange={(e) => setNuevoLibro({ ...nuevoLibro, paginas: e.target.value })} required />
              <input type="text" placeholder="URL de imagen" value={nuevoLibro.imagen} onChange={(e) => setNuevoLibro({ ...nuevoLibro, imagen: e.target.value })} required />
              <textarea placeholder="Sinopsis" value={nuevoLibro.sinopsis} onChange={(e) => setNuevoLibro({ ...nuevoLibro, sinopsis: e.target.value })} required></textarea>
              <button type="submit" className="admin-submit-button">{editMode ? "Actualizar" : "Crear"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogPage;
