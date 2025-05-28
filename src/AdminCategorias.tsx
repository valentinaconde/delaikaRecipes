import { createContext, useContext, useState } from 'react';
import { RecetasContext } from './App';

export const CategoriasContext = createContext<{
  categorias: string[];
  setCategorias: React.Dispatch<React.SetStateAction<string[]>>;
}>({
  categorias: [],
  setCategorias: () => {},
});

const AdminCategorias: React.FC = () => {
  const { categorias, setCategorias } = useContext(CategoriasContext);
  const { recetas, setRecetas } = useContext(RecetasContext);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!nuevaCategoria.trim() || categorias.includes(nuevaCategoria.trim())) return;
    setCategorias(prev => [...prev, nuevaCategoria.trim()]);
    setNuevaCategoria('');
  };

  const handleDelete = (idx: number) => {
    const catToDelete = categorias[idx];
    setCategorias(prev => prev.filter((_, i) => i !== idx));
    setRecetas(prev => prev.map(r => r.categoria === catToDelete ? { ...r, categoria: '' } : r));
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(categorias[idx]);
  };

  const handleEditSave = () => {
    if (!editValue.trim() || categorias.includes(editValue.trim())) return;
    const oldCat = categorias[editIndex!];
    setCategorias(prev => prev.map((cat, i) => (i === editIndex ? editValue.trim() : cat)));
    setRecetas(prev => prev.map(r => r.categoria === oldCat ? { ...r, categoria: editValue.trim() } : r));
    setEditIndex(null);
    setEditValue('');
  };

  return (
    <div className="admin-categorias">
      <h2>Categorías</h2>
      <div className="abml-categorias-form">
        <input
          type="text"
          className='agregar-categoria-input'
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={e => setNuevaCategoria(e.target.value)}
        />
        <button onClick={handleAdd} className="agregar-categoria-btn">Agregar</button>
      </div>
      <ul className="abml-categorias-list">
        {categorias.map((cat, idx) => (
          <li key={cat} className="abml-categorias-item">
            {editIndex === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); }}
                  autoFocus
                />
                <button onClick={handleEditSave} >Guardar</button>
                <button onClick={() => { setEditIndex(null); setEditValue(''); }}>Cancelar</button>
              </>
            ) : (
              <>
                <span>{cat}</span>
                <button onClick={() => handleEdit(idx)}>Editar</button>
                <button onClick={() => handleDelete(idx)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategorias;
