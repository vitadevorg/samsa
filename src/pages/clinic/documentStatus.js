import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { getDocumentStatus } from '../../data/institutions';

// Color e ícono del badge según el estado de un documento del médico.
// Los usan la ventana de Documentación (clínica, hospital y VitaDev) y el perfil del médico.
export const STATUS_BADGES = {
  vigente: { label: 'Vigente', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
  vencido: { label: 'Vencido', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  por_vencer: { label: 'Por vencer', className: 'bg-amber-100 text-amber-700 border-amber-200', Icon: AlertTriangle },
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock },
};

// Cantidad de documentos vencidos o pendientes (se muestra como aviso en el botón Documentación).
export const countDocumentIssues = (documents = [], today) =>
  documents.filter((doc) => !['vigente', 'por_vencer'].includes(getDocumentStatus(doc, today))).length;

// Cantidad de documentos que vencen pronto (aviso ámbar, no bloquea).
export const countDocumentsExpiringSoon = (documents = [], today) =>
  documents.filter((doc) => getDocumentStatus(doc, today) === 'por_vencer').length;
