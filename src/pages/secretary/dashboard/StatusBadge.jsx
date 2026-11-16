import React from 'react';

const STATUS_STYLES = {
  waiting: { label: 'En Sala', className: 'bg-amber-50 text-amber-700 border border-amber-100' },
  attending: { label: 'Atendiendo', className: 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse' },
  finished: { label: 'Finalizado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700 border border-red-100' },
  pending: { label: 'Pendiente', className: 'bg-gray-50 text-gray-500 border border-gray-200' },
};

const StatusBadge = ({ status }) => {
  const { label, className } = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`${className} inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap`}>{label}</span>
  );
};

export default StatusBadge;
