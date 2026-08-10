// frontend/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calcule le numéro de séance actuel et le total pour un objectif.
 * @param {string} currentSessionId - ID de la séance actuelle.
 * @param {Object} objectif - L'objet objectif contenant ses séances rattachées.
 * @returns {string|null} - "1 / 8" ou null si la séance n'est pas trouvée ou sans objectif.
 */
export function getSessionNumber(currentSessionId, objectif) {
  if (!objectif || !objectif.sessions || !Array.isArray(objectif.sessions)) {
    return null;
  }

  // Trouver la séance par son ID
  const session = objectif.sessions.find(s => s.id === currentSessionId);
  if (!session || session.session_number === null || session.session_number === undefined) {
    return null;
  }

  const totalPlanned = objectif.total_sessions || objectif.sessions.length;
  return `${session.session_number} / ${totalPlanned}`;
}

/**
 * Vérifie si un objectif est plein.
 * @param {number} objectifId - ID de l'objectif.
 * @returns {Promise<boolean>} - True si l'objectif est plein.
 */
export async function isObjectifFull(objectifId) {
  const response = await fetch(`/api/objectifs/${objectifId}/check-full`);
  const data = await response.json();
  return data.isFull;
}

/**
 * Formate une durée en minutes en format lisible.
 * @param {number} minutes - Durée en minutes.
 * @returns {string} - Durée formatée.
 */
export function formatDuration(minutes) {
  if (!minutes) return "0min";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
}
