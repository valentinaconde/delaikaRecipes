import React from 'react';

type Receta = {
  id: number;
  titulo: string;
  imagen: string;
};

type RecetasGridProps = {
  recetas: Receta[];
};

const RecetasGrid: React.FC<RecetasGridProps> = ({ recetas }) => {
  return (
    <div className="recetas-grid">
      {recetas.map((receta) => (
        <div className="receta-card" key={receta.id}>
          <img src={receta.imagen} alt={receta.titulo} className="receta-img" />
          <div className="receta-titulo">{receta.titulo}</div>
        </div>
      ))}
    </div>
  );
};

export default RecetasGrid;
