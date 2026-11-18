import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import IconAction from '../vitadev/IconAction';
import { useClinicData } from './clinicDataContext';
import { doctorsData } from '../../data/doctors';
import { formatSchedule } from '../../data/institutions';
import { Users, Edit2, Trash2, Search, X } from 'lucide-react';

const findDoctor = (doctorId) => doctorsData.find((doctor) => doctor.id === doctorId);

// Texto para comparar en la búsqueda: minúsculas y sin tildes,
// así "gonzalez" encuentra a "González". normalize('NFD') separa la letra de
// su tilde ("á" -> "a" + "´") y el replace borra las tildes sueltas.
const normalizeText = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Badge de tipo de personal (mismos colores que usa el proyecto: azul médico, rosa secretaria).
const TypeBadge = ({ type }) =>
  type === 'doctor' ? (
    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Médico</span>
  ) : (
    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold border border-pink-200">Secretaria</span>
  );

// Pantalla del administrador de institución (clínica u hospital): todo su personal.
// No tiene formularios propios: para editar lleva a Médicos o Secretarias con el
// formulario ya abierto, y para eliminar usa las mismas funciones del contexto.
const ClinicStaff = () => {
  const navigate = useNavigate();
  const { clinic, units, terms, basePath, assignments, secretaries, removeAssignment, removeSecretary } = useClinicData();
  // Persona a eliminar: { type: 'doctor' | 'secretary', id, name } o null.
  const [toDelete, setToDelete] = useState(null);
  // Lo que se escribe en la barra de búsqueda.
  const [search, setSearch] = useState('');

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Unificamos médicos y secretarias en una sola lista con la misma forma,
  // así las dos pestañas pueden mostrarlos juntos.
  const staff = [
    ...assignments.map((a) => ({
      type: 'doctor',
      id: a.id,
      name: findDoctor(a.doctorId)?.name,
      area: a.area,
      detail: `${a.office} · ${formatSchedule(a)}`,
    })),
    ...secretaries.map((s) => ({
      type: 'secretary',
      id: s.id,
      name: s.name,
      area: s.area,
      detail: `${s.email}${s.phone ? ` · ${s.phone}` : ''}`,
    })),
  ]
    // Orden: primero los médicos y después las secretarias; dentro de cada tipo, por nombre.
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

  // Búsqueda: una persona aparece si el texto buscado está en su nombre, su tipo
  // (médico / secretaria), su área o sector, o su detalle (consultorio, email, teléfono).
  const query = normalizeText(search.trim());
  const isSearching = query !== '';
  const matches = (person) => {
    const typeLabel = person.type === 'doctor' ? 'medico' : 'secretaria';
    const text = normalizeText(`${person.name} ${typeLabel} ${person.area} ${person.detail}`);
    return text.includes(query);
  };
  const visibleStaff = isSearching ? staff.filter(matches) : staff;

  // Una lista por área o sector. Si alguien quedó con un área que ya no existe,
  // va a un grupo aparte para que no desaparezca de la pantalla.
  let groups = units.map((unit) => ({ unit, people: visibleStaff.filter((p) => p.area === unit) }));
  const withoutUnit = visibleStaff.filter((p) => !units.includes(p.area));
  if (withoutUnit.length > 0) groups.push({ unit: `Sin ${terms.unitLower}`, people: withoutUnit });
  // Mientras se busca, ocultamos las áreas o sectores sin resultados.
  if (isSearching) groups = groups.filter((group) => group.people.length > 0);

  // Editar: vamos a la pantalla correspondiente pasando el id en `state`
  // (ClinicDoctors / ClinicSecretaries lo leen y abren el formulario en modo edición).
  const handleEdit = (person) => {
    const path = person.type === 'doctor' ? `${basePath}/doctors` : `${basePath}/secretaries`;
    navigate(path, { state: { editId: person.id } });
  };

  const handleConfirmDelete = () => {
    if (toDelete.type === 'doctor') removeAssignment(toDelete.id);
    else removeSecretary(toDelete.id);
    setToDelete(null);
  };

  // Botones de editar y eliminar (los mismos íconos que en las otras pantallas).
  const actions = (person) => (
    <div className="flex justify-start lg:justify-end gap-1 pt-2 lg:pt-0">
      <IconAction icon={Edit2} tone="orange" onClick={() => handleEdit(person)} label={`Editar a ${person.name}`} />
      <IconAction icon={Trash2} tone="red" onClick={() => setToDelete(person)} label={`Eliminar a ${person.name}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <ConfirmModal
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={toDelete?.type === 'doctor' ? 'Quitar Profesional' : 'Eliminar Secretaria'}
        message={toDelete?.type === 'doctor'
          ? `¿Confirma que desea quitar a ${toDelete?.name} de ${clinic.name}? Si no trabaja en otra institución, se dará de baja su cuenta.`
          : `¿Confirma que desea eliminar a ${toDelete?.name} de ${clinic.name}? Se dará de baja su cuenta y no podrá volver a iniciar sesión.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={Users}
          eyebrow={`Administración ${terms.fromPlace}`}
          title="Personal"
          description={`${clinic.name} · ${clinic.address} · ${assignments.length} médico(s) y ${secretaries.length} secretaria(s)`}
        />

        {/* Barra de búsqueda (mismo estilo que la de Profesionales) */}
        <FadeIn delay={100}><div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="search"
            aria-label="Buscar personal"
            placeholder={`Buscar por nombre, ${terms.unitLower}, consultorio o email...`}
            maxLength={60}
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isSearching && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4"/>
            </button>
          )}
        </div></FadeIn>
        {isSearching && (
          <p className="text-sm text-gray-500 mb-3 ml-1" aria-live="polite">
            {visibleStaff.length} resultado(s) para “{search.trim()}”
          </p>
        )}

        {/* Todo el personal en una sola tabla, organizada por área o sector */}
        <FadeIn delay={200}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Nombre</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Tipo</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Detalle</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            {/* Un <tbody> por área o sector: su primera fila es el título del grupo */}
            {groups.map(({ unit, people }) => (
              <tbody key={unit} className="block lg:table-row-group divide-y divide-gray-100 lg:divide-gray-50 border-t border-gray-100">
                <tr className="block lg:table-row bg-blue-50/60">
                  <th colSpan={4} scope="rowgroup" className="block lg:table-cell px-5 py-3 text-left">
                    <span className="font-bold text-gray-800">{unit}</span>
                    <span className="ml-2 text-xs font-bold text-gray-400 uppercase">{people.length} persona(s)</span>
                  </th>
                </tr>
                {people.length === 0 ? (
                  <tr className="block lg:table-row">
                    <td colSpan={4} className="block lg:table-cell px-5 py-4 text-sm text-gray-400">Sin personal en {terms.thisUnit}.</td>
                  </tr>
                ) : (
                  people.map((person) => (
                    <tr key={person.id} className="block lg:table-row px-5 py-4 lg:p-0 hover:bg-blue-50/50 transition">
                      <td className="block lg:table-cell py-1 lg:p-5 font-bold text-gray-900">{person.name}</td>
                      <td className="block lg:table-cell py-1 lg:p-5"><TypeBadge type={person.type} /></td>
                      <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">{person.detail}</td>
                      <td className="block lg:table-cell py-1 lg:p-5">{actions(person)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            ))}
          </table>
          {staff.length === 0 && (
            <div className="p-10 text-center text-gray-400">{terms.placeCap} todavía no tiene personal.</div>
          )}
          {staff.length > 0 && isSearching && visibleStaff.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-gray-500 font-medium">No encontramos personal con “{search.trim()}”.</p>
              <button onClick={() => setSearch('')} className="mt-3 text-blue-600 font-bold hover:text-blue-800 transition">
                Ver todo el personal
              </button>
            </div>
          )}
        </div></FadeIn>
      </div>
    </div>
  );
};

export default ClinicStaff;
