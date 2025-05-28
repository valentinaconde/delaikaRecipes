import React from 'react';

type CategoriasSidebarProps = {
  categorias: string[];
};

const CategoriasSidebar: React.FC<CategoriasSidebarProps> = ({ categorias }) => {
  return (
    <aside className="sidebar" aria-label="Categorías">
      <div className="sidebar-title">categorias</div>
      <ul className="category-list">
        {categorias.map((cat) => (
          <li key={cat} className="category-item">{cat}</li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoriasSidebar;
