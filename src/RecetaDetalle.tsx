import React, { useState } from 'react';
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
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="detalle-container">
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <h2 className="detalle-titulo">{receta.titulo}</h2>
        <button
          className="compartir-btn"
          aria-label="Compartir receta"
          title="Compartir receta"
          onClick={handleShare}
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 12, padding: 0 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#414833" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        {copied && (
          <span className="copied-tooltip" role="status" aria-live="polite" style={{ marginLeft: 8, color: '#737A5D', fontSize: '0.98rem' }}>¡Enlace copiado!</span>
        )}
      </div>
      <div className="detalle-layout">
        <img src={(receta.imagen ?? (receta as any).image) || '/logo.png'} alt={receta.titulo} className="detalle-foto" />
        <div className="detalle-ingredientes">
          <div className="detalle-ingredientes-titulo">INGREDIENTES</div>
          <ul>
            {receta.ingredientes.map((ing, i) => {
              // Verificar si el ingrediente es un título
              if (ing.trim().toLowerCase().startsWith('titulo')) {
                const tituloText = ing.replace(/^titulo[:]?\s*/i, '').trim();
                return (
                  <li key={i} className="detalle-ingrediente-titulo" style={{
                    listStyle: 'none', 
                    fontWeight: 'bold', 
                    margin: '12px 0 8px -20px',
                    color: '#414833'
                  }}>
                    {tituloText.toUpperCase()}
                  </li>
                );
              }
              // Ingrediente normal
              return <li key={i}>{ing}</li>;
            })}
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
              
              // Verificar si es un comentario
              const isComentario = /^(tip|tips|aclaracion|comentario)[:]?/i.test(lower);
              if (isComentario) {
                return (
                  <li key={i} className="detalle-paso-comentario" style={{listStyle: 'none', fontStyle: 'italic', color: '#7c6f57', margin: '8px 0', paddingLeft: '2em'}}>
                    <span role="note" aria-label="Comentario o tip">💡 {paso.replace(/^(tip|tips|aclaracion|comentario)[:]?/i, '').trim()}</span>
                  </li>
                );
              }
              
              // Verificar si es un título (resetea el contador)
              if (lower.startsWith('titulo')) {
                pasoIndex = 0;
                const tituloText = paso.replace(/^titulo[:]?\s*/i, '').trim();
                return (                  <li key={i} className="detalle-paso-titulo-section" style={{
                    listStyle: 'none', 
                    fontWeight: 'bold', 
                    margin: '20px 0 12px -20px',
                    color: '#414833',
                    paddingTop: '15px'
                  }}>
                    {tituloText.toUpperCase()}
                  </li>
                );
              }
              
              // Paso normal
              pasoIndex++;
              return <li key={i} value={pasoIndex}>{paso}</li>;
            });
          })()}
        </ol>
      </div>
      {recetasRelacionadas && recetasRelacionadas.length > 0 && (
        <div className="relacionadas-section">
          <h3 className="relacionadas-titulo">Recetas relacionadas</h3>
          <RecetasGrid recetas={recetasRelacionadas.slice(0, 6)} />
        </div>
      )}
    </div>
  );
};

export default RecetaDetalle;
