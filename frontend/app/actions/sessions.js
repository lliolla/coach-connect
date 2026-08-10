// frontend/app/actions/sessions.js
import { createClient } from '@/lib/supabase/client';

/**
 * Vérifie si un objectif a atteint son nombre maximal de séances.
 * @param {number} objectifId - ID de l'objectif.
 * @returns {Promise<boolean>} - True si l'objectif est plein.
 */
export async function isObjectifFull(objectifId) {
  const supabase = await createClient();

  const { data: objectif } = await supabase
    .from('objectifs')
    .select('total_sessions')
    .eq('id', objectifId)
    .single();

  if (!objectif) throw new Error('Objectif non trouvé');

  const { count: currentSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('objectif_id', objectifId);

  return currentSessions >= objectif.total_sessions;
}

/**
 * Récupère toutes les séances.
 * @returns {Promise<Array>} - Liste des séances triées par session_number.
 */
export async function getSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_number', { ascending: true, nulls: 'last' });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Récupère une séance par son ID.
 * @param {string} sessionId - UUID de la séance.
 * @returns {Promise<Object>} - La séance.
 */
export async function getSessionById(sessionId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crée une nouvelle séance.
 * @param {Object} sessionData - Données de la séance.
 * @param {number|null} sessionData.objectif_id - ID de l'objectif (peut être NULL).
 * @returns {Promise<Object>} - La séance créée.
 */
export async function createSession(sessionData) {
  const supabase = await createClient();

  if (sessionData.objectif_id) {
    // Vérifier que l'objectif n'est pas plein
    if (await isObjectifFull(sessionData.objectif_id)) {
      throw new Error('Nombre maximal de séances atteint pour cet objectif');
    }

    // Récupérer le prochain numéro de séance
    const { count: nextNumber } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('objectif_id', sessionData.objectif_id);

    sessionData.session_number = nextNumber + 1;
  } else {
    sessionData.session_number = null;
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprime une séance et renumérote les suivantes.
 * @param {string} sessionId - UUID de la séance.
 * @returns {Promise<void>}
 */
export async function deleteSession(sessionId) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('delete_session_and_renumber', {
    p_session_id: sessionId,
  });
  if (error) throw error;
}

/**
 * Met à jour une séance.
 * @param {string} sessionId - UUID de la séance.
 * @param {Object} updates - Champs à mettre à jour.
 * @returns {Promise<Object>} - La séance mise à jour.
 */
export async function updateSession(sessionId, updates) {
  const supabase = await createClient();

  // Si l'objectif change, gérer la renumérotation
  if ('objectif_id' in updates) {
    const { data: currentSession } = await supabase
      .from('sessions')
      .select('objectif_id, session_number')
      .eq('id', sessionId)
      .single();

    if (currentSession.objectif_id !== updates.objectif_id) {
      // Retirer de l'ancien objectif
      if (currentSession.objectif_id) {
        await supabase.rpc('delete_session_and_renumber', {
          p_session_id: sessionId,
        });
      }

      // Ajouter au nouvel objectif
      if (updates.objectif_id) {
        if (await isObjectifFull(updates.objectif_id)) {
          throw new Error('Nombre maximal de séances atteint pour le nouvel objectif');
        }

        const { count: nextNumber } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('objectif_id', updates.objectif_id);

        updates.session_number = nextNumber + 1;
      } else {
        updates.session_number = null;
      }
    }
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Déplace une séance dans le même objectif.
 * @param {string} sessionId - UUID de la séance.
 * @param {number} newPosition - Nouvelle position (1-based).
 * @returns {Promise<void>}
 */
export async function moveSessionWithinObjectif(sessionId, newPosition) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('move_session_within_objectif', {
    p_session_id: sessionId,
    p_new_position: newPosition,
  });
  if (error) throw error;
}

/**
 * Déplace une séance vers un autre objectif.
 * @param {string} sessionId - UUID de la séance.
 * @param {number} newObjectifId - ID du nouvel objectif.
 * @param {number} newPosition - Nouvelle position (1-based).
 * @returns {Promise<void>}
 */
export async function moveSessionToAnotherObjectif(sessionId, newObjectifId, newPosition) {
  const supabase = await createClient();

  // Vérifier que le nouvel objectif n'est pas plein
  if (await isObjectifFull(newObjectifId)) {
    throw new Error('Nombre maximal de séances atteint pour le nouvel objectif');
  }

  const { error } = await supabase.rpc('move_session_to_another_objectif', {
    p_session_id: sessionId,
    p_new_objectif_id: newObjectifId,
    p_new_position: newPosition,
  });
  if (error) throw error;
}

/**
 * Duplique une séance.
 * @param {string} sessionId - UUID de la séance à dupliquer.
 * @returns {Promise<Object>} - La séance dupliquée.
 */
export async function duplicateSession(sessionId) {
  const supabase = await createClient();

  // Récupérer la séance originale
  const { data: originalSession, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) throw fetchError;
  if (!originalSession) throw new Error('Séance non trouvée');

  // Vérifier que l'objectif n'est pas plein
  if (originalSession.objectif_id && await isObjectifFull(originalSession.objectif_id)) {
    throw new Error('Nombre maximal de séances atteint pour cet objectif');
  }

  // Récupérer le prochain numéro de séance
  let nextNumber = 0;
  if (originalSession.objectif_id) {
    const { count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('objectif_id', originalSession.objectif_id);
    nextNumber = count + 1;
  }

  // Créer la nouvelle séance
  const { data: newSession, error: insertError } = await supabase
    .from('sessions')
    .insert({
      ...originalSession,
      id: undefined, // Générer un nouvel UUID
      created_at: undefined,
      session_number: originalSession.objectif_id ? nextNumber : null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Dupliquer les exercices
  const { data: exercises, error: exercisesError } = await supabase
    .from('session_exercises')
    .select('*')
    .eq('session_id', sessionId);

  if (exercisesError) throw exercisesError;

  if (exercises && exercises.length > 0) {
    const { error: insertExercisesError } = await supabase
      .from('session_exercises')
      .insert(
        exercises.map(ex => ({
          ...ex,
          session_id: newSession.id,
        }))
      );

    if (insertExercisesError) throw insertExercisesError;
  }

  return newSession;
}
