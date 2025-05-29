import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type CategoriaSidebar = { id: number; nombre: string };
export type CategoriasSidebarProps = {
  categorias: CategoriaSidebar[];
  categoriaSeleccionada: CategoriaSidebar | null;
  onCategoriaClick: (categoria: CategoriaSidebar | null) => void;
  isMobile?: boolean;
  visible?: boolean;
};

const CategoriasSidebar: React.FC<CategoriasSidebarProps> = ({ categorias, categoriaSeleccionada, onCategoriaClick, isMobile = false, visible = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = (cat: CategoriaSidebar | null) => {
    if (location.pathname.startsWith('/receta/')) {
      // Redirigir a la pantalla principal con filtro
      navigate(`/?categoria=${encodeURIComponent(cat?.nombre ?? '')}`);
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
            key={cat.id}
            className={`category-item${categoriaSeleccionada?.id === cat.id ? ' selected' : ''}`}
            onClick={() => handleClick(cat)}
            tabIndex={0}
            aria-label={cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(cat); }}
          >
            {cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1)}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoriasSidebar;
