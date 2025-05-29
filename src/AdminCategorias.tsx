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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNombre, setNewNombre] = useState('');
  const [edit, setEdit] = useState<EditState>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) setError(error.message);
    else setCategorias(data || []);
    setLoading(false);
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
        />
        <button onClick={handleAdd} disabled={saving || !newNombre.trim()}>Agregar</button>
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
      <ul className="abml-categorias-list">
        {categorias.map(cat => (
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
