import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useSearchParams } from 'react-router-dom'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'
import RecetaDetalle from './RecetaDetalle'

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
    ingredientes: ['Calabaza', 'Harina', 'Huevo', 'Sal', 'Pimienta'],
    pasos: ['Cocinar la calabaza.', 'Hacer un puré.', 'Agregar harina y huevo.', 'Formar los ñoquis y hervir.'],
  },
  {
    id: 2,
    titulo: 'Panna cotta',
    imagen: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    categoria: 'Postres',
    ingredientes: ['Crema', 'Azúcar', 'Gelatina', 'Vainilla'],
    pasos: ['Calentar la crema.', 'Agregar azúcar y vainilla.', 'Disolver la gelatina.', 'Refrigerar.'],
  },
  {
    id: 3,
    titulo: 'Queso y nueces',
    imagen: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
    ingredientes: ['Queso', 'Nueces', 'Miel'],
    pasos: ['Cortar el queso.', 'Agregar nueces.', 'Rociar con miel.'],
  },
  {
    id: 4,
    titulo: 'Burrata con nueces',
    imagen: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
    ingredientes: ['Burrata', 'Nueces', 'Aceite de oliva'],
    pasos: ['Colocar la burrata.', 'Agregar nueces.', 'Rociar con aceite.'],
  },
  {
    id: 5,
    titulo: 'Higos y alcauciles',
    imagen: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    categoria: 'Ensaladas',
    ingredientes: ['Higos', 'Alcauciles', 'Aceite de oliva'],
    pasos: ['Cortar los higos.', 'Cocinar alcauciles.', 'Mezclar y aliñar.'],
  },
  {
    id: 6,
    titulo: 'Omelette',
    imagen: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    categoria: 'Carnes',
    ingredientes: ['Huevos', 'Sal', 'Pimienta', 'Queso'],
    pasos: ['Batir los huevos.', 'Cocinar en sartén.', 'Agregar queso.', 'Doblar y servir.'],
  },
];

const MainView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(categoriaParam || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategoriaSeleccionada(categoriaParam || null);
    if (categoriaParam !== null) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 600); // Simula carga
      return () => clearTimeout(timeout);
    }
    setLoading(false);
  }, [categoriaParam]);

  const recetasFiltradas = categoriaSeleccionada
    ? recetas.filter(r => r.categoria === categoriaSeleccionada)
    : recetas;
  const handleCategoriaClick = (cat: string | null) => {
    setCategoriaSeleccionada(cat);
    setLoading(true);
    setSearchParams(cat ? { categoria: cat } : {});
  };
  return (
    <div className="layout">
      <CategoriasSidebar
        categorias={categories}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaClick={handleCategoriaClick}
      />
      <main className="main-content">
        <span className="section-title">recetas</span>
        {loading ? (
          <div className="loading-spinner">Cargando...</div>
        ) : (
          <RecetasGrid recetas={recetasFiltradas} />
        )}
      </main>
    </div>
  );
};

const RecetaDetalleWrapper = () => {
  const { id } = useParams();
  const receta = recetas.find(r => r.id === Number(id));
  if (!receta) return <Navigate to="/" replace />;
  return (
    <div className="layout">
      <CategoriasSidebar
        categorias={categories}
        categoriaSeleccionada={receta.categoria}
        onCategoriaClick={() => {}}
      />
      <main className="main-content">
        <RecetaDetalle receta={receta} />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <nav className="navbar" aria-label="Barra de navegación principal">
        <span className="navbar-title">delaika</span>
      </nav>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/receta/:id" element={<RecetaDetalleWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
