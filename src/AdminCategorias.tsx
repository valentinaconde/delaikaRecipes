import { createContext, useState, useContext } from 'react';

export const CategoriasContext = createContext<{
  categorias: string[];
  setCategorias: React.Dispatch<React.SetStateAction<string[]>>;
}>({
  categorias: [],
  setCategorias: () => {},
});

const AdminCategorias: React.FC = () => {
  const { categorias, setCategorias } = useContext(CategoriasContext);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!nuevaCategoria.trim() || categorias.includes(nuevaCategoria.trim())) return;
    setCategorias(prev => [...prev, nuevaCategoria.trim()]);
    setNuevaCategoria('');
  };

  const handleDelete = (idx: number) => {
    setCategorias(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(categorias[idx]);
  };

  const handleEditSave = () => {
    if (!editValue.trim() || categorias.includes(editValue.trim())) return;
    setCategorias(prev => prev.map((cat, i) => (i === editIndex ? editValue.trim() : cat)));
    setEditIndex(null);
    setEditValue('');
  };

  return (
    <div className="admin-categorias">
      <h2>Categorías</h2>
      <div className="abml-categorias-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={e => setNuevaCategoria(e.target.value)}
        />
        <button onClick={handleAdd}>Agregar</button>
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
                <button onClick={handleEditSave}>Guardar</button>
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
