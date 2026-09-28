import React from 'react';

const STATUS_STYLES = {
  waiting: { label: 'En Sala', className: 'bg-yellow-100 text-yellow-700' },
  attending: { label: 'Atendiendo', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  finished: { label: 'Finalizado', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  pending: { label: 'Pendiente', className: 'bg-slate-100 text-slate-500' },
};

const StatusBadge = ({ status }) => {
  const { label, className } = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`${className} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>{label}</span>
  );
};

export default StatusBadge;
