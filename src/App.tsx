import './App.css'

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
        <aside className="sidebar" aria-label="Categorías">
          <div className="sidebar-title">categorias</div>
          <ul className="category-list">
            {categories.map((cat) => (
              <li key={cat} className="category-item">{cat}</li>
            ))}
          </ul>
        </aside>
        <main className="main-content">
          <span className="section-title">recetas</span>
        </main>
      </div>
    </>
  )
}

export default App
