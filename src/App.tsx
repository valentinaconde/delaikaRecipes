import './App.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useSearchParams, useNavigate, Link, Outlet } from 'react-router-dom'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'
import RecetaDetalle from './RecetaDetalle'
import AdminCategorias, { CategoriasContext } from './AdminCategorias'
import AdminRecetas from './AdminRecetas'

export const RecetasContext = createContext<{
  recetas: any[];
  setRecetas: React.Dispatch<React.SetStateAction<any[]>>;
}>({
  recetas: [],
  setRecetas: () => {},
});

const categories = [
  'Postres',
  'Ensaladas',
  'Carnes',
  'Bebidas',
  'Sopas',
  'Pastas'
];

const recetasIniciales = [
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
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
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
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
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
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
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
  const [showCategorias, setShowCategorias] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setShowCategorias(false);
    else setShowCategorias(true);
  }, [isMobile]);

  useEffect(() => {
    setCategoriaSeleccionada(categoriaParam || null);
    if (categoriaParam !== null) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timeout);
    }
    setLoading(false);
  }, [categoriaParam, setLoading]);

  const { recetas } = useContext(RecetasContext);
  const recetasFiltradas = categoriaSeleccionada
    ? recetas.filter(r => r.categoria === categoriaSeleccionada)
    : recetas;
  const handleCategoriaClick = (cat: string | null) => {
    setCategoriaSeleccionada(cat);
    setLoading(true);
    setSearchParams(cat ? { categoria: cat } : {});
    if (isMobile) setShowCategorias(false);
  };
  const handleToggleCategorias = () => setShowCategorias(v => !v);
  const handleToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') handleToggleCategorias();
  };
  return (
    <div className="layout">
      {isMobile && (
        <button
          className="categorias-toggle-btn"
          aria-label="Mostrar/ocultar categorías"
          aria-expanded={showCategorias}
          aria-controls="categorias-sidebar"
          tabIndex={0}
          onClick={handleToggleCategorias}
          onKeyDown={handleToggleKeyDown}
        >
          Categorías
        </button>
      )}
      <CategoriasSidebar
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaClick={handleCategoriaClick}
        isMobile={isMobile}
        visible={showCategorias}
        // id for aria-controls
        {...(isMobile ? { id: 'categorias-sidebar' } : {})}
      />
      <main
        className={`main-content${isMobile ? (showCategorias ? ' main-content--with-categorias' : ' main-content--without-categorias') : ''}`}
      >
        <span className="section-title">recetas</span>
        <RecetasGrid recetas={recetasFiltradas} />
      </main>
    </div>
  );
};

const RecetaDetalleWrapper = ({ categorias }: { categorias: string[] }) => {
  const { id } = useParams();
  const { recetas } = useContext(RecetasContext);
  const receta = recetas.find(r => r.id === Number(id));
  const [showCategorias, setShowCategorias] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setShowCategorias(false);
    else setShowCategorias(true);
  }, [isMobile]);

  const handleToggleCategorias = () => setShowCategorias(v => !v);
  const handleToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') handleToggleCategorias();
  };

  if (!receta) return <Navigate to="/" replace />;
  return (
    <div className="layout">
      {isMobile && (
        <button
          className="categorias-toggle-btn"
          aria-label="Mostrar/ocultar categorías"
          aria-expanded={showCategorias}
          aria-controls="categorias-sidebar"
          tabIndex={0}
          onClick={handleToggleCategorias}
          onKeyDown={handleToggleKeyDown}
        >
          Categorías
        </button>
      )}
      <CategoriasSidebar
        categorias={categorias}
        categoriaSeleccionada={receta.categoria}
        onCategoriaClick={() => {}}
        isMobile={isMobile}
        visible={showCategorias}
        {...(isMobile ? { id: 'categorias-sidebar' } : {})}
      />
      <main
        className={`main-content${isMobile ? (showCategorias ? ' main-content--with-categorias' : ' main-content--without-categorias') : ''}`}
      >
        <RecetaDetalle receta={receta} />
      </main>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [categorias, setCategorias] = useState(categories);
  const [recetas, setRecetas] = useState(recetasIniciales);
  return (
    <AuthContext.Provider value={{ logged, setLogged }}>
      <LoadingContext.Provider value={{ loading, setLoading }}>
        <CategoriasContext.Provider value={{ categorias, setCategorias }}>
          <RecetasContext.Provider value={{ recetas, setRecetas }}>
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
          </RecetasContext.Provider>
        </CategoriasContext.Provider>
      </LoadingContext.Provider>
    </AuthContext.Provider>
  )
}

export default App
