import React from 'react';
import './App.css';

type RecetaDetalleProps = {
  receta: {
    titulo: string;
    imagen: string;
    ingredientes: string[];
    pasos: string[];
  };
};

const RecetaDetalle: React.FC<RecetaDetalleProps> = ({ receta }) => {
  return (
    <div className="detalle-container">
      <h2 className="detalle-titulo">{receta.titulo}</h2>
      <div className="detalle-layout">
        <img src={receta.imagen} alt={receta.titulo} className="detalle-foto" />
        <div className="detalle-ingredientes">
          <div className="detalle-ingredientes-titulo">INGREDIENTES</div>
          <ul>
            {receta.ingredientes.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="detalle-pasos">
        <div className="detalle-pasos-titulo">PASO A PASO</div>
        <ol>
          {receta.pasos.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecetaDetalle;
