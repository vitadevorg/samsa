import React from 'react';
import Navbar from '../../components/Navbar';
import { Shield } from 'lucide-react';

// Pantalla inicial del administrador de VitaDev.
// Por ahora es solo un placeholder: sus funciones se agregan en una próxima tarea.
const VitadevDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg"><Shield className="text-blue-600 w-8 h-8"/></div>
        Panel de VitaDev
      </h1>
      <p className="text-gray-500 mt-3">Esta sección está en construcción.</p>
    </div>
  </div>
);

export default VitadevDashboard;
