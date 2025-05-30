import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const initialForm = {
  titulo: '',
  imagen: '',
  categoria: '',
  ingredientes: '', // string separado por coma
  pasos: '', // string separado por salto de línea
};

type Categoria = { id: number; nombre: string };
type Receta = {
  id: number;
  titulo: string;
  imagen: string;
  categoria: string;
  ingredientes: string[];
  pasos: string[];
  idCategoria: number | null;
};

const AdminRecetas: React.FC = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingRecetas, setLoadingRecetas] = useState(false);

  // Fetch categorías y recetas+ingredientes
  const fetchAll = async () => {
    setLoadingCategorias(true);
    setLoadingRecetas(true);
    setError(null);
    // Categorías
    const { data: catData } = await supabase.from('categorias').select('id, nombre').order('nombre');
    setCategorias(catData || []);
    setLoadingCategorias(false);
    // Recetas
    const { data: recData, error: recError } = await supabase.from('recetas').select('*').order('id', { ascending: false });
    if (recError) { setError(recError.message); setLoadingRecetas(false); return; }
    // Ingredientes
    const { data: ingData } = await supabase.from('ingredientes').select('*');
    // Mapear recetas con ingredientes
    const recetasMap: Receta[] = (recData || []).map(r => ({
      id: r.id,
      titulo: r.titulo,
      imagen: r.image,
      categoria: catData?.find(c => c.id === r.idCategoria)?.nombre || '',
      ingredientes: (ingData || []).filter(i => i.idReceta === r.id).map(i => i.detalle),
      pasos: r.pasos ? r.pasos.split('\n').map((p: string) => p.trim()).filter(Boolean) : [],
      idCategoria: r.idCategoria,
    }));
    setRecetas(recetasMap);
    setLoadingRecetas(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // AGREGAR
  const handleAdd = async () => {
    if (!form.titulo.trim() || !form.categoria) return;
    setLoading(true); setError(null); setSuccess('');
    // Buscar idCategoria
    const cat = categorias.find(c => c.nombre === form.categoria);
    if (!cat) { setError('Categoría inválida'); setLoading(false); return; }
    // Insertar receta
    const { data: recetaInsert, error: recetaError } = await supabase.from('recetas').insert({
      titulo: form.titulo.trim(),
      image: form.imagen.trim(),
      idCategoria: cat.id,
      pasos: form.pasos.trim(),
    }).select().single();
    if (recetaError || !recetaInsert) { setError(recetaError?.message || 'Error al agregar receta'); setLoading(false); return; }
    // Insertar ingredientes
    const ingredientesArr = form.ingredientes.split(',').map(i => i.trim()).filter(Boolean);
    if (ingredientesArr.length > 0) {
      const { error: ingError } = await supabase.from('ingredientes').insert(
        ingredientesArr.map(detalle => ({ detalle, idReceta: recetaInsert.id }))
      );
      if (ingError) { setError(ingError.message); setLoading(false); return; }
    }
    setSuccess('Receta agregada');
    setForm(initialForm);
    await fetchAll();
    setLoading(false);
  };

  // ELIMINAR
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta receta?')) return;
    setLoading(true); setError(null); setSuccess('');
    // Eliminar ingredientes
    await supabase.from('ingredientes').delete().eq('idReceta', id);
    // Eliminar receta
    const { error } = await supabase.from('recetas').delete().eq('id', id);
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess('Receta eliminada');
    await fetchAll();
    setLoading(false);
  };

  // EDITAR
  const handleEdit = (receta: Receta) => {
    setEditId(receta.id);
    setForm({
      titulo: receta.titulo,
      imagen: receta.imagen,
      categoria: receta.categoria,
      ingredientes: receta.ingredientes.join(', '),
      pasos: receta.pasos.join('\n'),
    });
  };

  const handleEditSave = async () => {
    if (editId === null) return;
    setLoading(true); setError(null); setSuccess('');
    const cat = categorias.find(c => c.nombre === form.categoria);
    if (!cat) { setError('Categoría inválida'); setLoading(false); return; }
    // Actualizar receta
    const { error: recError } = await supabase.from('recetas').update({
      titulo: form.titulo.trim(),
      image: form.imagen.trim(),
      idCategoria: cat.id,
      pasos: form.pasos.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', editId);
    if (recError) { setError(recError.message); setLoading(false); return; }
    // Eliminar ingredientes viejos
    await supabase.from('ingredientes').delete().eq('idReceta', editId);
    // Insertar nuevos ingredientes
    const ingredientesArr = form.ingredientes.split(',').map(i => i.trim()).filter(Boolean);
    if (ingredientesArr.length > 0) {
      const { error: ingError } = await supabase.from('ingredientes').insert(
        ingredientesArr.map(detalle => ({ detalle, idReceta: editId }))
      );
      if (ingError) { setError(ingError.message); setLoading(false); return; }
    }
    setSuccess('Receta actualizada');
    setEditId(null);
    setForm(initialForm);
    await fetchAll();
    setLoading(false);
  };

  return (
    <div className="admin-recetas">
      <h2>Recetas</h2>
      <div className="abml-recetas-form">
        <input name="titulo" type="text" placeholder="Título" value={form.titulo} onChange={handleChange} disabled={loading} />
        <input name="imagen" type="text" placeholder="URL de imagen" value={form.imagen} onChange={handleChange} disabled={loading} />
        <select name="categoria" value={form.categoria} onChange={handleChange} disabled={loading}>
          <option value="">Sin categoría</option>
          {categorias.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
        </select>        <textarea name="ingredientes" placeholder="Ingredientes (separados por coma; inicia con 'titulo' para crear secciones en negrita)" value={form.ingredientes} onChange={handleChange} disabled={loading} />
        <textarea name="pasos" placeholder="Pasos (uno por línea; usa 'titulo' para crear secciones y reiniciar numeración; usa tip/comentario para notas)" value={form.pasos} onChange={handleChange} disabled={loading} />
        {editId === null ? (
          <button onClick={handleAdd} disabled={loading}>Agregar</button>
        ) : (
          <button onClick={handleEditSave} disabled={loading}>Guardar</button>
        )}
        {editId !== null && (
          <button onClick={() => { setEditId(null); setForm(initialForm); }} disabled={loading}>Cancelar</button>
        )}
      </div>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
      {/* Buscador de recetas */}
      <div style={{ maxWidth: 400, margin: '1.2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar receta..."
          aria-label="Buscar receta"
          style={{ width: '100%', padding: '0.6em 1em', borderRadius: 6, border: '1.5px solid var(--color-dun)', fontSize: '1rem', background: 'var(--color-bone)', color: '#222', textAlign: 'left' }}
        />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#414833" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: -30, pointerEvents: 'none'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      {loadingCategorias && <div className="loading-spinner">Cargando categorías...</div>}
      {loadingRecetas && <div className="loading-spinner">Cargando recetas...</div>}
      <ul className="abml-recetas-list">
        {[...recetas]
          .filter(r => r.titulo.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
          .map((receta) => (
            <li key={receta.id} className="abml-recetas-item">
              <span>
                <b>{receta.titulo}</b>
                <span style={{ marginLeft: 8 }}>
                  ({receta.categoria || 'Sin categoría'})
                </span>
              </span>
              <div>
                <button onClick={() => handleEdit(receta)} disabled={loading}>Editar</button>
                <button onClick={() => handleDelete(receta.id)} disabled={loading}>Eliminar</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AdminRecetas;
