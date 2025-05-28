import './App.css'
import { useState } from 'react'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'

const categories = [
  'Postres',
  'Ensaladas',
  'Carnes',
  'Bebidas',
  'Sopas',
  'Pastas'
];

const recetas = [
  {
    id: 1,
    titulo: 'Ñoquis de calabaza',
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    categoria: 'Pastas',
  },
  {
    id: 2,
    titulo: 'Panna cotta',
    imagen: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    categoria: 'Postres',
  },
  {
    id: 3,
    titulo: 'Queso y nueces',
    imagen: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
  },
  {
    id: 4,
    titulo: 'Burrata con nueces',
    imagen: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
  },
  {
    id: 5,
    titulo: 'Higos y alcauciles',
    imagen: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
  },
  {
    id: 6,
    titulo: 'Omelette',
    imagen: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    categoria: 'Carnes',
  },
];

const App = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const recetasFiltradas = categoriaSeleccionada
    ? recetas.filter(r => r.categoria === categoriaSeleccionada)
    : recetas;

  return (
    <>
      <nav className="navbar" aria-label="Barra de navegación principal">
        <span className="navbar-title">delaika</span>
      </nav>
      <div className="layout">
        <CategoriasSidebar
          categorias={categories}
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoriaClick={setCategoriaSeleccionada}
        />
        <main className="main-content">
          <span className="section-title">recetas</span>
          <RecetasGrid recetas={recetasFiltradas} />
        </main>
      </div>
    </>
  )
}

export default App
