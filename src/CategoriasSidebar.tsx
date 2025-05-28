import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type CategoriasSidebarProps = {
  categorias: string[];
  categoriaSeleccionada: string | null;
  onCategoriaClick: (categoria: string | null) => void;
  isMobile?: boolean;
  visible?: boolean;
};

const CategoriasSidebar: React.FC<CategoriasSidebarProps> = ({ categorias, categoriaSeleccionada, onCategoriaClick, isMobile = false, visible = true }) => {
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
    <aside
      className={`sidebar${isMobile ? (visible ? ' sidebar--visible' : ' sidebar--hidden') : ''}`}
      aria-label="Categorías"
      aria-hidden={isMobile && !visible}
    >
      <div className="sidebar-title">CATEGORIAS</div>
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
