import React from 'react';
import { Check, AlertTriangle, XCircle, Info } from 'lucide-react';

// Configuration des styles selon le type de message
const TYPE_CONFIGS = {
  success: {
    bg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    Icon: Check,
  },
  error: {
    bg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: XCircle,
  },
  warning: {
    bg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon: Info,
  },
};

export const StatusModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
}) => {
  if (!isOpen) return null;

  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.success;
  const { Icon, bg, iconColor } = config;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity"
      onClick={onClose}
    >
      {/* Conteneur de la modale */}
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors du clic sur le contenu
      >
        {/* Badge d'icône */}
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${bg}`}>
          <Icon className={`h-7 w-7 stroke-[2.5] ${iconColor}`} />
        </div>

        {/* Titre */}
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className="mt-2 text-sm text-gray-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};