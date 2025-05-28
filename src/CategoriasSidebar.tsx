import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type CategoriasSidebarProps = {
  categorias: string[];
  categoriaSeleccionada: string | null;
  onCategoriaClick: (categoria: string | null) => void;
};

const CategoriasSidebar: React.FC<CategoriasSidebarProps> = ({ categorias, categoriaSeleccionada, onCategoriaClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = (cat: string | null) => {
    if (location.pathname.startsWith('/receta/')) {
      // Redirigir a la pantalla principal con filtro
      navigate(`/?categoria=${encodeURIComponent(cat ?? '')}`);
    }
    onCategoriaClick(cat);
  };
  return (
    <aside className="sidebar" aria-label="Categorías">
      <div className="sidebar-title">categorias</div>
      <ul className="category-list">
        <li
          className={`category-item${!categoriaSeleccionada ? ' selected' : ''}`}
          onClick={() => handleClick(null)}
          tabIndex={0}
          aria-label="Todas las categorías"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(null); }}
        >
          Todas
        </li>
        {categorias.map((cat) => (
          <li
            key={cat}
            className={`category-item${categoriaSeleccionada === cat ? ' selected' : ''}`}
            onClick={() => handleClick(cat)}
            tabIndex={0}
            aria-label={cat}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(cat); }}
          >
            {cat}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoriasSidebar;
