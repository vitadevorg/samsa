import React, { useId } from 'react';
import { useClinicData } from '../clinic/clinicDataContext';
import { doctorsData } from '../../data/doctors';
import { Building2 } from 'lucide-react';

// Médicos de clínicas y hospitales, solo lectura: indica en qué institución trabaja cada uno.
// Los administra cada institución; la baja y el reseteo de contraseña están en Usuarios.
const InstitutionDoctorsList = () => {
  const fieldId = useId();
  const { allAssignments, institutions } = useClinicData();

  // Un médico por fila, aunque atienda en varias instituciones.
  const doctors = [];
  allAssignments.forEach((assignment) => {
    const place = institutions.find((i) => i.id === assignment.institutionId)?.name;
    const existing = doctors.find((d) => d.id === assignment.doctorId);
    if (existing) {
      existing.places.push(place);
      return;
    }
    const doctor = doctorsData.find((d) => d.id === assignment.doctorId);
    if (doctor) doctors.push({ id: doctor.id, name: doctor.name, specialty: doctor.specialty, places: [place] });
  });
  doctors.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section aria-labelledby={`${fieldId}-titulo`}>
      <h2 id={`${fieldId}-titulo`} className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg"><Building2 className="text-indigo-600 w-6 h-6"/></div>
        Médicos de clínicas y hospitales
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Trabaja en</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-blue-50/50 transition">
                <td className="p-5">
                  <div className="font-bold text-gray-900">{doctor.name}</div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 inline-block mt-1">{doctor.specialty}</span>
                </td>
                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {doctor.places.map((place) => (
                      <span key={place} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">{place}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div className="p-10 text-center text-gray-400">Todavía no hay médicos vinculados a clínicas u hospitales.</div>
        )}
      </div>
    </section>
  );
};

export default InstitutionDoctorsList;
