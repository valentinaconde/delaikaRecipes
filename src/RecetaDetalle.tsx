import React from 'react';
import './App.css';
import RecetasGrid from './RecetasGrid';

type RecetaDetalleProps = {
  receta: {
    titulo: string;
    imagen: string;
    ingredientes: string[];
    pasos: string[];
  };
  recetasRelacionadas?: Array<{
    id: number;
    titulo: string;
    imagen: string;
  }>;
};

const RecetaDetalle: React.FC<RecetaDetalleProps> = ({ receta, recetasRelacionadas }) => {
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
        <ol className="detalle-pasos-list">
          {(() => {
            let pasoIndex = 0;
            return receta.pasos.map((paso, i) => {
              const lower = paso.trim().toLowerCase();
              const isComentario = /^(tip|tips|aclaracion|comentario)[:]?/i.test(lower);
              if (isComentario) {
                return (
                  <li key={i} className="detalle-paso-comentario" style={{listStyle: 'none', fontStyle: 'italic', color: '#7c6f57', margin: '8px 0', paddingLeft: '2em'}}>
                    <span role="note" aria-label="Comentario o tip">💡 {paso.replace(/^(tip|tips|aclaracion|comentario)[:]?/i, '').trim()}</span>
                  </li>
                );
              }
              pasoIndex++;
              return <li key={i} value={pasoIndex}>{paso}</li>;
            });
          })()}
        </ol>
      </div>
      {recetasRelacionadas && recetasRelacionadas.length > 0 && (
        <div className="relacionadas-section">
          <h3 className="relacionadas-titulo">Recetas relacionadas</h3>
          <RecetasGrid recetas={recetasRelacionadas.slice(0, 5)} />
        </div>
      )}
    </div>
  );
};

export default RecetaDetalle;
