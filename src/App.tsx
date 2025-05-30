// Variables de entorno necesarias para Supabase:
// VITE_SUPABASE_URL=<tu-url-de-supabase>
// VITE_SUPABASE_ANON_KEY=<tu-anon-key-de-supabase>

import './App.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useParams, Outlet, useLocation } from 'react-router-dom'
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

const MainView = ({ setGlobalLoading }: { setGlobalLoading: (v: boolean) => void }) => {
  const location = useLocation();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);
  const [showCategorias, setShowCategorias] = useState(false); // Por defecto cerrado en mobile
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [search, setSearch] = useState('');
  const [loadingRecetas, setLoadingRecetas] = useState(true); // Nuevo estado

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categorías al montar
  useEffect(() => {
    const fetchCategorias = async () => {
      setGlobalLoading(true);
      const { data, error } = await supabase.from('categorias').select('id, nombre').order('nombre');
      if (error) setError(error.message);
      else setCategorias(data || []);
      setGlobalLoading(false);
    };
    fetchCategorias();
  }, []);

  // Leer query param 'categoria' al montar o cambiar la url
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catNombre = params.get('categoria');
    if (catNombre && categorias.length > 0) {
      const cat = categorias.find(c => c.nombre.toLowerCase() === catNombre.toLowerCase());
      if (cat) setCategoriaSeleccionada(cat);
      else setCategoriaSeleccionada(null);
    } else if (!catNombre) {
      setCategoriaSeleccionada(null);
    }
  }, [location.search, categorias]);

  // Fetch recetas según categoría seleccionada
  useEffect(() => {
    let ignore = false;
    const fetchRecetas = async () => {
      setLoadingRecetas(true);
      setError(null);
      let query = supabase.from('recetas').select('*');
      if (categoriaSeleccionada) {
        query = query.eq('idCategoria', categoriaSeleccionada.id);
      }
      const { data, error } = await query.order('id', { ascending: false });
      if (ignore) return;
      if (error) setError(error.message);
      else setRecetas(data || []);
      setLoadingRecetas(false);
    };
    // Solo buscar si las categorías ya están cargadas (para evitar recetas no filtradas)
    if (categorias.length > 0) fetchRecetas();
    else setLoadingRecetas(true);
    return () => { ignore = true; };
  }, [categoriaSeleccionada, categorias]);

  const handleToggleCategorias = () => setShowCategorias(v => !v);

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
          style={{ justifyContent: 'space-between', width: '100%', display: 'flex', alignItems: 'center', background: 'var(--color-sage)', border: 'none', borderRadius: 0, fontWeight: 600, fontSize: '1.1rem', padding: '1rem 1.2rem', margin: 0, cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600 }}>CATEGORÍAS</span>
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
        onCategoriaClick={cat => {
          setCategoriaSeleccionada(cat);
          if (isMobile) setShowCategorias(false);
        }}
        isMobile={isMobile}
        visible={isMobile ? showCategorias : true}
      />
      <main className={`main-content${isMobile && showCategorias ? ' main-content--with-categorias' : ''}`} style={isMobile && showCategorias ? { marginTop: 0 } : {}}>
        <div className="sticky-header">
          <nav className="breadcrumb sticky-breadcrumb" aria-label="breadcrumb">
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
          <div className="busqueda-input sticky-busqueda-input">
            <div style={{ maxWidth: 400, margin: '1.2rem auto 1.5rem auto', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar receta..."
                aria-label="Buscar receta"
                style={{ width: '100%', padding: '10px 20px', borderRadius: 6, border: '1.5px solid var(--color-dun)', fontSize: '1rem', background: 'var(--color-bone)', color: '#222', textAlign: 'left' }}
              />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#414833" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: -40, pointerEvents: 'none'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>
        </div>
        {error && <div style={{color: 'red'}}>{error}</div>}
        {loadingRecetas ? (
          <div className="loading-spinner">Cargando recetas...</div>
        ) : (
          <RecetasGrid recetas={
            [...recetas]
              .filter(r => r.titulo.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
          } />
        )}
      </main>
    </div>
  );
};

const RecetaDetalleWrapper: React.FC<{ setGlobalLoading: (v: boolean) => void }> = ({ setGlobalLoading }) => {
  const { id } = useParams();
  const [receta, setReceta] = useState<any | null>(null);
  const [ingredientes, setIngredientes] = useState<string[]>([]);
  const [pasos, setPasos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);
  const [showCategorias, setShowCategorias] = useState(false); // Comienza cerrado en detalle de receta
  const [isMobile, setIsMobile] = useState(false);
  const [recetasRelacionadas, setRecetasRelacionadas] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      setGlobalLoading(true);
      const { data } = await supabase.from('categorias').select('id, nombre').order('nombre');
      setCategorias(data || []);
      setGlobalLoading(false);
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchReceta = async () => {
      setGlobalLoading(true);
      setLoading(true);
      setError(null);
      // Traer receta
      const { data, error } = await supabase.from('recetas').select('*').eq('id', id).single();
      if (error || !data) {
        setError(error?.message || 'No encontrada');
        setLoading(false);
        setGlobalLoading(false);
        return;
      }
      setReceta(data);
      // Traer ingredientes
      const { data: ingData } = await supabase.from('ingredientes').select('detalle').eq('idReceta', id);
      setIngredientes((ingData || []).map(i => i.detalle));
      // Pasos
      setPasos(data.pasos ? data.pasos.split('\n').map((p: string) => p.trim()).filter(Boolean) : []);
      // Traer recetas relacionadas (misma categoría, excluyendo la actual)
      if (data.idCategoria) {
        const { data: relacionadas } = await supabase
          .from('recetas')
          .select('*')
          .eq('idCategoria', data.idCategoria)
          .neq('id', id)
          .order('id', { ascending: false })
          .limit(5);
        setRecetasRelacionadas(relacionadas || []);
      } else {
        setRecetasRelacionadas([]);
      }
      setLoading(false);
      setGlobalLoading(false);
    };
    if (id) fetchReceta();
  }, [id]);

  const handleCategoriaClick = (cat: { id: number; nombre: string } | null) => {
    setCategoriaSeleccionada(cat);
    if (isMobile) setShowCategorias(false);
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
          onClick={() => setShowCategorias(v => !v)}
          style={{ justifyContent: 'space-between', width: '100%', display: 'flex', alignItems: 'center', background: 'var(--color-sage)', border: 'none', borderRadius: 0, fontWeight: 600, fontSize: '1.1rem', padding: '1rem 1.2rem', margin: 0, cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600 }}>CATEGORÍAS</span>
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
        {error && <div style={{color: 'red'}}>{error}</div>}
        {!loading && !error && receta && (
          <RecetaDetalle receta={{
            titulo: receta.titulo,
            imagen: receta.image,
            ingredientes,
            pasos,
          }} recetasRelacionadas={recetasRelacionadas} />
        )}
      </main>
    </div>
  );
};

// Layout para el área de admin con sidebar e imagen de fondo
const AdminLayout: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className="admin-layout">
      {isMobile && (
        <button
          className="categorias-toggle-btn"
          aria-label="Mostrar/ocultar menú admin"
          aria-expanded={showMenu}
          aria-controls="admin-sidebar"
          tabIndex={0}
          onClick={() => setShowMenu(v => !v)}
          style={{ justifyContent: 'space-between', width: '100%', display: 'flex', alignItems: 'center', background: 'var(--color-sage)', border: 'none', borderRadius: 0, fontWeight: 600, fontSize: '1.1rem', padding: '1rem 1.2rem', margin: 0, cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600 }}>MENÚ</span>
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
      <aside className={`admin-sidebar${isMobile ? (showMenu ? ' admin-sidebar--visible' : ' admin-sidebar--hidden') : ''}`} id="admin-sidebar">
        <div className="sidebar-title">MENÚ</div>
        <ul className="category-list">
          <li className="category-item">
            <Link to="/admin/categorias">Categorías</Link>
          </li>
          <li className="category-item">
            <Link to="/admin/recetas">Recetas</Link>
          </li>
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
};

// Componente para proteger rutas admin
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
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

// Spinner global
const GlobalSpinner: React.FC<{ visible: boolean }> = ({ visible }) => (
  visible ? (
    <div className="global-spinner-overlay">
      <div className="global-spinner" aria-label="Cargando" />
    </div>
  ) : null
);

const App = () => {
  const [globalLoading, setGlobalLoading] = useState(false);

  // Interceptar navegación para mostrar spinner
  useEffect(() => {
    const handleStart = () => setGlobalLoading(true);
    const handleEnd = () => setGlobalLoading(false);
    window.addEventListener('delaika-loading-start', handleStart);
    window.addEventListener('delaika-loading-end', handleEnd);
    return () => {
      window.removeEventListener('delaika-loading-start', handleStart);
      window.removeEventListener('delaika-loading-end', handleEnd);
    };
  }, []);

  return (
    <SupabaseAuthProvider>
      <GlobalSpinner visible={globalLoading} />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainView setGlobalLoading={setGlobalLoading} />} />
          <Route path="/receta/:id" element={<RecetaDetalleWrapper setGlobalLoading={setGlobalLoading} />} />
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
