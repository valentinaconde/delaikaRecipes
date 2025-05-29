// Variables de entorno necesarias para Supabase:
// VITE_SUPABASE_URL=<tu-url-de-supabase>
// VITE_SUPABASE_ANON_KEY=<tu-anon-key-de-supabase>

import './App.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useSearchParams, useParams, Outlet } from 'react-router-dom'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'
import RecetaDetalle from './RecetaDetalle'
import AdminCategorias from './AdminCategorias'
import AdminRecetas from './AdminRecetas'
import { useSupabaseAuth } from './hooksSupabaseAuth'

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

// Definición única y correcta de recetasIniciales
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
  }
];
// Contexto global para auth
const SupabaseAuthContext = createContext<{
  session: any;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
} | null>(null);

export const useAuth = () => {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error('useAuth must be used within SupabaseAuthProvider');
  return ctx;
};

const LoginIcon: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  if (session) return null;
  return (
    <button className="login-icon-btn" aria-label="Iniciar sesión" onClick={() => navigate('/login')}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/></svg>
    </button>
  );
};

const LogoutIcon: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    signOut();
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
  const { session } = useAuth();
  return (
    <nav className="navbar" aria-label="Barra de navegación principal">
      <Link to="/" className="navbar-logo-link" tabIndex={0} aria-label="Ir a inicio">
        <img src="/logo.png" alt="delaika logo" className="navbar-logo" height={32} />
      </Link>
      <span className="navbar-spacer" />
      {session && <AdminIcon />}
      {session ? <LogoutIcon /> : <LoginIcon />}
    </nav>
  );
};

const LoginView: React.FC = () => {
  const { signInWithGoogle, session, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) navigate('/admin', { replace: true });
  }, [session, navigate]);

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <button
        className="google-login-btn"
        onClick={handleLogin}
        disabled={loading}
        aria-label="Iniciar sesión con Google"
      >
        {loading ? 'Cargando...' : 'Iniciar sesión con Google'}
      </button>
      {error && <div className="login-error">{error}</div>}
    </div>
  );
};

const MainView = ({ categorias }: { categorias: string[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(categoriaParam || null);
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
  }, [categoriaParam]);

  const { recetas } = useContext(RecetasContext);
  const recetasFiltradas = categoriaSeleccionada
    ? recetas.filter(r => r.categoria === categoriaSeleccionada)
    : recetas;
  const handleCategoriaClick = (cat: string | null) => {
    setCategoriaSeleccionada(cat);
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
          style={{ justifyContent: 'space-between' }}
        >
          <span>Categorías</span>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            style={{ marginLeft: 'auto' }}
          >
            <rect x="4" y="7" width="16" height="2" rx="1" fill="#414833" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="#414833" />
            <rect x="4" y="15" width="16" height="2" rx="1" fill="#414833" />
          </svg>
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
        <nav className="breadcrumb" aria-label="breadcrumb">
          <a
            href="/"
            className="breadcrumb-link"
            tabIndex={0}
            aria-label="Ir a recetas"
            onClick={e => { e.preventDefault(); setCategoriaSeleccionada(null); setSearchParams({}); }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setCategoriaSeleccionada(null); setSearchParams({}); } }}
          >
            RECETAS
          </a>
          {categoriaSeleccionada && (
            <>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <span className="breadcrumb-current">{categoriaSeleccionada}</span>
            </>
          )}
        </nav>
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
          style={{ justifyContent: 'space-between' }}
        >
          <span>Categorías</span>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            style={{ marginLeft: 'auto' }}
          >
            <rect x="4" y="7" width="16" height="2" rx="1" fill="#414833" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="#414833" />
            <rect x="4" y="15" width="16" height="2" rx="1" fill="#414833" />
          </svg>
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
        <nav className="breadcrumb" aria-label="breadcrumb">
          <a
            href="/"
            className="breadcrumb-link"
            tabIndex={0}
            aria-label="Ir a recetas"
            style={{ textTransform: 'uppercase' }}
            onClick={e => { e.preventDefault(); window.location.href = '/'; }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { window.location.href = '/'; } }}
          >
            RECETAS
          </a>
          {receta.categoria && (
            <>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <a
                href={`/?categoria=${encodeURIComponent(receta.categoria)}`}
                className="breadcrumb-link"
                tabIndex={0}
                aria-label={`Ver recetas de ${receta.categoria}`}
                style={{ textTransform: 'uppercase' }}
                onClick={e => {
                  e.preventDefault();
                  window.location.href = `/?categoria=${encodeURIComponent(receta.categoria)}`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = `/?categoria=${encodeURIComponent(receta.categoria)}`;
                  }
                }}
              >
                {receta.categoria}
              </a>
            </>
          )}
        </nav>
        <RecetaDetalle receta={receta} />
      </main>
    </div>
  );
};

// Layout para el área de admin con sidebar e imagen de fondo
const AdminLayout: React.FC = () => (
  <div className="admin-layout">
    <aside className="admin-sidebar">
      <ul>
        <li><Link to="/admin/categorias">Categorías</Link></li>
        <li><Link to="/admin/recetas">Recetas</Link></li>
      </ul>
    </aside>
    <main className="admin-main">
      <Outlet />
      <Routes>
        <Route index element={
          <div className="admin-bg-image-wrapper">
            <img src="/admin.png" alt="admin area" className="admin-bg-image" />
          </div>
        } />
      </Routes>
    </main>
  </div>
);

// Componente para proteger rutas admin
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Declarar el provider SupabaseAuthProvider en App.tsx
const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSupabaseAuth();
  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

const App = () => {
  const [categorias] = useState(categories);
  const [recetas, setRecetas] = useState(recetasIniciales);
  return (
    <SupabaseAuthProvider>
      <RecetasContext.Provider value={{ recetas, setRecetas }}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<MainView categorias={categorias} />} />
            <Route path="/receta/:id" element={<RecetaDetalleWrapper categorias={categorias} />} />
            <Route path="/login" element={<LoginView />} />
            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route path="categorias" element={<AdminCategorias />} />
              <Route path="recetas" element={<AdminRecetas />} />
              <Route index element={<div />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </RecetasContext.Provider>
    </SupabaseAuthProvider>
  )
}

export default App
