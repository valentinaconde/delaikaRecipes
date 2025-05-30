import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Tipo para la categoría según la tabla de Supabase
export type Categoria = {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type EditState = {
  id: number;
  nombre: string;
} | null;

const AdminCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newNombre, setNewNombre] = useState('');
  const [edit, setEdit] = useState<EditState>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) setError(error.message);
    else setCategorias(data || []);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAdd = async () => {
    if (!newNombre.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess('');
    const { error } = await supabase.from('categorias').insert({ nombre: newNombre.trim() });
    if (error) setError(error.message);
    else {
      setSuccess('Categoría agregada');
      setNewNombre('');
      fetchCategorias();
    }
    setSaving(false);
  };

  const handleEdit = (cat: Categoria) => setEdit({ id: cat.id, nombre: cat.nombre });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (edit) setEdit({ ...edit, nombre: e.target.value });
  };

  const handleEditSave = async () => {
    if (!edit || !edit.nombre.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess('');
    const { error } = await supabase.from('categorias').update({ nombre: edit.nombre.trim() }).eq('id', edit.id);
    if (error) setError(error.message);
    else {
      setSuccess('Categoría actualizada');
      setEdit(null);
      fetchCategorias();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setSaving(true);
    setError(null);
    setSuccess('');
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) setError(error.message);
    else {
      setSuccess('Categoría eliminada');
      fetchCategorias();
    }
    setSaving(false);
  };

  return (
    <div className="admin-categorias">
      <h2>Categorías</h2>
      <div className="abml-categorias-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={newNombre}
          onChange={e => setNewNombre(e.target.value)}
          disabled={saving}
          className="abml-categorias-input"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newNombre.trim()}
          className="abml-categorias-btn"
        >
          Agregar
        </button>
      </div>
      {/* Buscador de categorías */}
      <div className="busqueda-input">
      <div style={{ maxWidth: 400, margin: '1.2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          aria-label="Buscar categoría"
          style={{ width: '100%', padding: '10px 20px', borderRadius: 6, border: '1.5px solid var(--color-dun)', fontSize: '1rem', background: 'var(--color-bone)', color: '#222', textAlign: 'left' }}
        />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#414833" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: -40, pointerEvents: 'none'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      </div>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
      <ul className="abml-categorias-list">
        {[...categorias]
          .filter(cat => cat.nombre.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
          .map(cat => (
            <li key={cat.id} className="abml-categorias-item">
              {edit && edit.id === cat.id ? (
                <>
                  <input
                    type="text"
                    value={edit.nombre}
                    onChange={handleEditChange}
                    disabled={saving}
                    aria-label="Editar nombre de categoría"
                  />
                  <button onClick={handleEditSave} disabled={saving || !edit.nombre.trim()}>Guardar</button>
                  <button onClick={() => setEdit(null)} disabled={saving}>Cancelar</button>
                </>
              ) : (
                <>
                  <span>{cat.nombre}</span>
                  <button onClick={() => handleEdit(cat)} disabled={saving}>Editar</button>
                  <button onClick={() => handleDelete(cat.id)} disabled={saving}>Eliminar</button>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AdminCategorias;
