import { useState } from 'react';
import { createId } from '../utils/ids';

const pickFormFields = (item, emptyForm) =>
  Object.fromEntries(Object.keys(emptyForm).map((key) => [key, item[key] ?? emptyForm[key]]));

/**
 * Estado y acciones de un ABM en memoria: alta/edición con un formulario y
 * baja con confirmación. Cuando haya backend, este es el único lugar que
 * debería cambiar para llamar al servicio correspondiente.
 *
 * - emptyForm: valores iniciales del formulario (definirlo fuera del componente).
 * - toForm(item): convierte un ítem en valores de formulario (por defecto toma las claves de emptyForm).
 * - toItem(form, { isNew }): convierte el formulario en el ítem a guardar.
 * - validate(form): si devuelve false, no se guarda.
 */
export const useCrudList = (initialItems, {
  emptyForm = {},
  toForm,
  toItem = (form) => form,
  validate = () => true,
} = {}) => {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const isEditing = editId !== null;

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm(toForm ? toForm(item) : pickFormFields(item, emptyForm));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!validate(form)) return;
    if (isEditing) {
      const changes = toItem(form, { isNew: false });
      setItems((prev) => prev.map((item) => (item.id === editId ? { ...item, ...changes } : item)));
    } else {
      const newItem = { ...toItem(form, { isNew: true }), id: createId() };
      setItems((prev) => [...prev, newItem]);
    }
    cancelEdit();
  };

  const requestDelete = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const confirmDelete = () => {
    setItems((prev) => prev.filter((item) => item.id !== deleteId));
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  return {
    items,
    form,
    setForm,
    isEditing,
    editId,
    startEdit,
    cancelEdit,
    submit,
    isDeleteOpen: deleteId !== null,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};
