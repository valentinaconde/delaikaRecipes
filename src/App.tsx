import './App.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useSearchParams, useNavigate, Link, Outlet } from 'react-router-dom'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'
import RecetaDetalle from './RecetaDetalle'
import AdminCategorias, { CategoriasContext } from './AdminCategorias'

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

// Contexto global para loading
const LoadingContext = createContext<{loading: boolean, setLoading: (v: boolean) => void}>({loading: false, setLoading: () => {}});
// Contexto global para auth
const AuthContext = createContext<{logged: boolean, setLogged: (v: boolean) => void}>({logged: false, setLogged: () => {}});

const LoginIcon: React.FC = () => {
  const { logged } = useContext(AuthContext);
  const navigate = useNavigate();
  if (logged) return null;
  return (
    <button className="login-icon-btn" aria-label="Iniciar sesión" onClick={() => navigate('/login')}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/></svg>
    </button>
  );
};

const LogoutIcon: React.FC = () => {
  const { setLogged } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    setLogged(false);
    navigate('/', { replace: true });
  };
  return (
    <button className="logout-icon-btn" aria-label="Cerrar sesión" onClick={handleLogout}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>
  );
};

const AdminIcon: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button className="admin-icon-btn" aria-label="Ir a admin" onClick={() => navigate('/admin')}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M16 3v4a2 2 0 0 1-2 2H8"/></svg>
    </button>
  );
};

const Navbar: React.FC = () => {
  const { logged } = useContext(AuthContext);
  return (
    <nav className="navbar" aria-label="Barra de navegación principal">
      <Link to="/" className="navbar-title" tabIndex={0} aria-label="Ir a inicio">delaika</Link>
      <span className="navbar-spacer" />
      {logged && <AdminIcon />}
      {logged ? <LogoutIcon /> : <LoginIcon />}
    </nav>
  );
};

const LoginView: React.FC = () => {
  const { setLogged } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (user === 'admin' && pass === 'admin') {
        setLogged(true);
        navigate('/admin', { replace: true });
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    }, 700);
  };
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} />
        <button type="submit">Entrar</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
};

const AdminSidebar: React.FC = () => (
  <aside className="admin-sidebar">
    <ul>
      <li><Link to="/admin/categorias" className="admin-sidebar-link">categorias</Link></li>
      <li><Link to="/admin/recetas" className="admin-sidebar-link">recetas</Link></li>
    </ul>
  </aside>
);

const AdminLayout: React.FC = () => (
  <div className="admin-layout">
    <header className="admin-header">
      <Link to="/" className="navbar-title" tabIndex={0} aria-label="Ir a inicio">delaika</Link>
    </header>
    <div className="admin-content">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  </div>
);

const AdminRecetas: React.FC = () => <div />;

const GlobalLoading: React.FC = () => {
  const { loading } = useContext(LoadingContext);
  if (!loading) return null;
  return (
    <div className="global-loading-overlay">
      <div className="global-spinner" aria-label="Cargando" />
    </div>
  );
};

const MainView = ({ categorias }: { categorias: string[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(categoriaParam || null);
  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setCategoriaSeleccionada(categoriaParam || null);
    if (categoriaParam !== null) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timeout);
    }
    setLoading(false);
  }, [categoriaParam, setLoading]);

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
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaClick={handleCategoriaClick}
      />
      <main className="main-content">
        <span className="section-title">recetas</span>
        <RecetasGrid recetas={recetasFiltradas} />
      </main>
    </div>
  );
};

const RecetaDetalleWrapper = ({ categorias }: { categorias: string[] }) => {
  const { id } = useParams();
  const receta = recetas.find(r => r.id === Number(id));
  if (!receta) return <Navigate to="/" replace />;
  return (
    <div className="layout">
      <CategoriasSidebar
        categorias={categorias}
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
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [categorias, setCategorias] = useState(categories);
  return (
    <AuthContext.Provider value={{ logged, setLogged }}>
      <LoadingContext.Provider value={{ loading, setLoading }}>
        <CategoriasContext.Provider value={{ categorias, setCategorias }}>
          <Router>
            <GlobalLoading />
            <Navbar />
            <Routes>
              <Route path="/" element={<MainView categorias={categorias} />} />
              <Route path="/receta/:id" element={<RecetaDetalleWrapper categorias={categorias} />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/admin" element={logged ? <AdminLayout /> : <Navigate to="/login" replace />}>
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="recetas" element={<AdminRecetas />} />
                <Route index element={<div />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CategoriasContext.Provider>
      </LoadingContext.Provider>
    </AuthContext.Provider>
  )
}

export default App
