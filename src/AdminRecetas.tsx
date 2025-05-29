import { useContext, useEffect, useState } from 'react';
import { RecetasContext } from './App';
import { supabase } from './supabaseClient';

const initialForm = {
  titulo: '',
  imagen: '',
  categoria: '',
  ingredientes: '',
  pasos: '',
};

const AdminRecetas: React.FC = () => {
  const { recetas, setRecetas } = useContext(RecetasContext);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase.from('categorias').select('nombre').order('nombre', { ascending: true });
      if (data) setCategorias(data.map((c: { nombre: string }) => c.nombre));
    };
    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.titulo.trim()) return;
    setRecetas(prev => [
      ...prev,
      {
        id: Date.now(),
        titulo: form.titulo,
        imagen: form.imagen,
        categoria: form.categoria,
        ingredientes: form.ingredientes.split(',').map(i => i.trim()).filter(Boolean),
        pasos: form.pasos.split('\n').map(p => p.trim()).filter(Boolean),
      },
    ]);
    setForm(initialForm);
  };

  const handleDelete = (id: number) => {
    setRecetas(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (idx: number) => {
    const receta = recetas[idx];
    setEditIndex(idx);
    setForm({
      titulo: receta.titulo,
      imagen: receta.imagen,
      categoria: receta.categoria,
      ingredientes: receta.ingredientes.join(', '),
      pasos: receta.pasos.join('\n'),
    });
  };

  const handleEditSave = () => {
    setRecetas(prev => prev.map((r, i) =>
      i === editIndex
        ? {
            ...r,
            titulo: form.titulo,
            imagen: form.imagen,
            categoria: form.categoria,
            ingredientes: form.ingredientes.split(',').map(i => i.trim()).filter(Boolean),
            pasos: form.pasos.split('\n').map(p => p.trim()).filter(Boolean),
          }
        : r
    ));
    setEditIndex(null);
    setForm(initialForm);
  };

  return (
    <div className="admin-recetas">
      <h2>Recetas</h2>
      <div className="abml-recetas-form">
        <input name="titulo" type="text" placeholder="Título" value={form.titulo} onChange={handleChange} />
        <input name="imagen" type="text" placeholder="URL de imagen" value={form.imagen} onChange={handleChange} />
        <select name="categoria" value={form.categoria} onChange={handleChange}>
          <option value="">Sin categoría</option>
          {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <textarea name="ingredientes" placeholder="Ingredientes (separados por coma)" value={form.ingredientes} onChange={handleChange} />
        <textarea name="pasos" placeholder="Pasos (uno por línea)" value={form.pasos} onChange={handleChange} />
        {editIndex === null ? (
          <button onClick={handleAdd}>Agregar</button>
        ) : (
          <button onClick={handleEditSave}>Guardar</button>
        )}
        {editIndex !== null && (
          <button onClick={() => { setEditIndex(null); setForm(initialForm); }}>Cancelar</button>
        )}
      </div>
      <ul className="abml-recetas-list">
        {recetas.map((receta, idx) => (
          <li key={receta.id} className="abml-recetas-item">
            <span><b>{receta.titulo}</b> ({receta.categoria || 'Sin categoría'})</span>
            <div>
              <button onClick={() => handleEdit(idx)}>Editar</button>
              <button onClick={() => handleDelete(receta.id)}>Eliminar</button>
            </div>
           
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminRecetas;
