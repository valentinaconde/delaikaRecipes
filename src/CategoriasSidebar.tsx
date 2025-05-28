import React from 'react';

type CategoriasSidebarProps = {
  categorias: string[];
  categoriaSeleccionada: string | null;
  onCategoriaClick: (categoria: string | null) => void;
};

const CategoriasSidebar: React.FC<CategoriasSidebarProps> = ({ categorias, categoriaSeleccionada, onCategoriaClick }) => {
  return (
    <aside className="sidebar" aria-label="Categorías">
      <div className="sidebar-title">categorias</div>
      <ul className="category-list">
        <li
          className={`category-item${!categoriaSeleccionada ? ' selected' : ''}`}
          onClick={() => onCategoriaClick(null)}
          tabIndex={0}
          aria-label="Todas las categorías"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onCategoriaClick(null); }}
        >
          Todas
        </li>
        {categorias.map((cat) => (
          <li
            key={cat}
            className={`category-item${categoriaSeleccionada === cat ? ' selected' : ''}`}
            onClick={() => onCategoriaClick(cat)}
            tabIndex={0}
            aria-label={cat}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onCategoriaClick(cat); }}
          >
            {cat}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoriasSidebar;
