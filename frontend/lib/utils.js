import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calcule la progression "Rang / Total" pour une séance liée à un objectif
 * @param {string} currentSessionId - ID de la séance actuelle
 * @param {Object} objectif - L'objet objectif contenant ses séances rattachées
 * @returns {string|null} - "5 / 20" ou null
 */
export function getSessionProgression(currentSessionId, objectif) {
  if (!objectif || !objectif.sessions || !Array.isArray(objectif.sessions)) return null;

  // 1. Trier les séances par date
  // On utilise localeCompare pour l'id en cas de dates identiques pour garantir un ordre stable
  const sortedSessions = [...objectif.sessions].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    if (dateA - dateB !== 0) return dateA - dateB;
    return (a.id || "").toString().localeCompare((b.id || "").toString());
  });

  // 2. Trouver le rang
  const index = sortedSessions.findIndex(s => s.id === currentSessionId);
  if (index === -1) return null;

  const currentRank = index + 1;
  const totalPlanned = objectif.total_sessions || sortedSessions.length;

  return `${currentRank} / ${totalPlanned}`;
}
