import React from 'react';
import { useNavigate } from 'react-router-dom';

type Receta = {
  id: number;
  titulo: string;
  imagen: string;
};

type RecetasGridProps = {
  recetas: Receta[];
};

const RecetasGrid: React.FC<RecetasGridProps> = ({ recetas }) => {
  const navigate = useNavigate();
  const handleCardClick = (id: number) => {
    navigate(`/receta/${id}`);
  };
  return (
    <div className="recetas-grid">
      {recetas.map((receta) => (
        <div
          className="receta-card"
          key={receta.id}
          onClick={() => handleCardClick(receta.id)}
          tabIndex={0}
          aria-label={`Ver receta ${receta.titulo}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(receta.id); }}
          style={{ cursor: 'pointer' }}
        >
          <img src={receta.imagen} alt={receta.titulo} className="receta-img" />
          <div className="receta-titulo">{receta.titulo}</div>
        </div>
      ))}
    </div>
  );
};

export default RecetasGrid;
