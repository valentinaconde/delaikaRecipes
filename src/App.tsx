import './App.css'
import CategoriasSidebar from './CategoriasSidebar'

const categories = [
  'Postres',
  'Ensaladas',
  'Carnes',
  'Bebidas',
  'Sopas',
  'Pastas'
];

const App = () => {
  return (
    <>
      <nav className="navbar" aria-label="Barra de navegación principal">
        <span className="navbar-title">delaika</span>
      </nav>
      <div className="layout">
        <CategoriasSidebar categorias={categories} />
        <main className="main-content">
          <span className="section-title">recetas</span>
        </main>
      </div>
    </>
  )
}

export default App
