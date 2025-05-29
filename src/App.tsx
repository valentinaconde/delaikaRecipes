// Variables de entorno necesarias para Supabase:
// VITE_SUPABASE_URL=<tu-url-de-supabase>
// VITE_SUPABASE_ANON_KEY=<tu-anon-key-de-supabase>

import './App.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useParams, Outlet } from 'react-router-dom'
import CategoriasSidebar from './CategoriasSidebar'
import RecetasGrid from './RecetasGrid'
import RecetaDetalle from './RecetaDetalle'
import AdminCategorias from './AdminCategorias'
import AdminRecetas from './AdminRecetas'
import { useSupabaseAuth } from './hooksSupabaseAuth'
import { supabase } from './supabaseClient'

export const RecetasContext = createContext<{
  recetas: any[];
  setRecetas: React.Dispatch<React.SetStateAction<any[]>>;
}>({
  recetas: [],
  setRecetas: () => {},
});

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

const MainView = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);
  const [showCategorias, setShowCategorias] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);

  // Fetch categorías al montar
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('categorias').select('id, nombre').order('nombre');
      if (error) setError(error.message);
      else setCategorias(data || []);
      setLoading(false);
    };
    fetchCategorias();
  }, []);

  // Fetch recetas según categoría seleccionada
  useEffect(() => {
    const fetchRecetas = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from('recetas').select('*');
      if (categoriaSeleccionada) {
        query = query.eq('idCategoria', categoriaSeleccionada.id);
      }
      const { data, error } = await query.order('id', { ascending: false });
      if (error) setError(error.message);
      else setRecetas(data || []);
      setLoading(false);
    };
    fetchRecetas();
  }, [categoriaSeleccionada]);

  const handleCategoriaClick = (cat: { id: number; nombre: string } | null) => {
    setCategoriaSeleccionada(cat);
    if (showCategorias) setShowCategorias(false);
  };

  return (
    <div className="layout">
      <CategoriasSidebar
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaClick={handleCategoriaClick}
        visible={showCategorias}
        {...(showCategorias ? { id: 'categorias-sidebar' } : {})}
      />
      <main className={`main-content${showCategorias ? ' main-content--with-categorias' : ' main-content--without-categorias'}`}>
        <nav className="breadcrumb" aria-label="breadcrumb">
          <a
            href="/"
            className="breadcrumb-link"
            tabIndex={0}
            aria-label="Ir a recetas"
            onClick={e => { e.preventDefault(); setCategoriaSeleccionada(null); }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setCategoriaSeleccionada(null); } }}
          >
            RECETAS
          </a>
          {categoriaSeleccionada && (
            <>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <span className="breadcrumb-current">{categoriaSeleccionada.nombre}</span>
            </>
          )}
        </nav>
        {loading && <div>Cargando...</div>}
        {error && <div style={{color: 'red'}}>{error}</div>}
        <RecetasGrid recetas={recetas} />
      </main>
    </div>
  );
};

const RecetaDetalleWrapper: React.FC = () => {
  const { id } = useParams();
  const [receta, setReceta] = useState<any | null>(null);
  const [ingredientes, setIngredientes] = useState<string[]>([]);
  const [pasos, setPasos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);
  const [showCategorias, setShowCategorias] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data } = await supabase.from('categorias').select('id, nombre').order('nombre');
      setCategorias(data || []);
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchReceta = async () => {
      setLoading(true);
      setError(null);
      // Traer receta
      const { data, error } = await supabase.from('recetas').select('*').eq('id', id).single();
      if (error || !data) {
        setError(error?.message || 'No encontrada');
        setLoading(false);
        return;
      }
      setReceta(data);
      // Traer ingredientes
      const { data: ingData } = await supabase.from('ingredientes').select('detalle').eq('idReceta', id);
      setIngredientes((ingData || []).map(i => i.detalle));
      // Pasos
      setPasos(data.pasos ? data.pasos.split('\n').map((p: string) => p.trim()).filter(Boolean) : []);
      setLoading(false);
    };
    if (id) fetchReceta();
  }, [id]);

  const handleCategoriaClick = (cat: { id: number; nombre: string } | null) => {
    setCategoriaSeleccionada(cat);
    if (isMobile) setShowCategorias(false);
  };

  return (
    <div className="layout">
      <CategoriasSidebar
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaClick={handleCategoriaClick}
        isMobile={isMobile}
        visible={showCategorias}
        {...(isMobile ? { id: 'categorias-sidebar' } : {})}
      />
      <main className="main-content">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <a
            href="/"
            className="breadcrumb-link"
            tabIndex={0}
            aria-label="Ir a recetas"
            onClick={e => { e.preventDefault(); window.location.href = '/'; }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/'; }}
          >
            RECETAS
          </a>
          {receta && receta.idCategoria && categorias.length > 0 && (
            <>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <a
                href={`/?categoria=${encodeURIComponent(categorias.find(c => c.id === receta.idCategoria)?.nombre || '')}`}
                className="breadcrumb-link"
                tabIndex={0}
                aria-label={`Ver recetas de ${categorias.find(c => c.id === receta.idCategoria)?.nombre || ''}`}
                onClick={e => {
                  e.preventDefault();
                  window.location.href = `/?categoria=${encodeURIComponent(categorias.find(c => c.id === receta.idCategoria)?.nombre || '')}`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = `/?categoria=${encodeURIComponent(categorias.find(c => c.id === receta.idCategoria)?.nombre || '')}`;
                  }
                }}
                style={{ textTransform: 'uppercase' }}
              >
                {categorias.find(c => c.id === receta.idCategoria)?.nombre || ''}
              </a>
            </>
          )}
        </nav>
        {loading && <div>Cargando...</div>}
        {error && <div style={{color: 'red'}}>{error}</div>}
        {!loading && !error && receta && (
          <RecetaDetalle receta={{
            titulo: receta.titulo,
            imagen: receta.image,
            ingredientes,
            pasos,
          }} />
        )}
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
  return (
    <SupabaseAuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/receta/:id" element={<RecetaDetalleWrapper />} />
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
    </SupabaseAuthProvider>
  )
}

export default App
