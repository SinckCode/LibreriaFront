import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/BookDetailPage.css";

const BookDetailPage = () => {
  const { id } = useParams();
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibro = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`https://104.248.118.8/libros/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener el libro");
        }

        const data = await response.json();
        setLibro(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLibro();
  }, [id]);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!libro) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="book-detail-container">
      <h1 className="book-detail-title">{libro.titulo}</h1>
      <img src={libro.imagen} alt={libro.titulo} className="book-detail-image" />
      <div className="book-detail-info">
        <p><strong>Autor:</strong> {libro.autor}</p>
        <p><strong>Categoría:</strong> {libro.categoria}</p>
        <p><strong>Año:</strong> {libro.anio}</p>
        <p><strong>Descripción:</strong> {libro.descripcion}</p>
      </div>
    </div>
  );
};

export default BookDetailPage;
