// frontend/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calcule le numéro de séance actuel et le total pour un objectif
 * @param {string} currentSessionId - ID de la séance actuelle
 * @param {Object} objectif - L'objet objectif contenant ses séances rattachées
 * @returns {string|null} - "1 / 8" ou null
 */
export function getSessionNumber(currentSessionId, objectif) {
  if (!objectif || !objectif.sessions || !Array.isArray(objectif.sessions)) return null;

  // 1. Trier les séances par session_number
  const sortedSessions = [...objectif.sessions].sort((a, b) => {
    return (a.session_number || 0) - (b.session_number || 0);
  });

  // 2. Trouver le rang
  const index = sortedSessions.findIndex(s => s.id === currentSessionId);
  if (index === -1) return null;

  const currentNumber = index + 1;
  const totalPlanned = objectif.total_sessions || sortedSessions.length;

  return `${currentNumber} / ${totalPlanned}`;
}
