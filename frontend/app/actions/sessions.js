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
    .select('*, objectif:objectifs(*), athletes:athletes(*)')
    .order('session_number', { ascending: true, nulls: 'last' });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Récupère une séance par son ID avec ses relations.
 * @param {string} sessionId - UUID de la séance.
 * @returns {Promise<Object>} - La séance avec ses relations.
 */
export async function getSessionById(sessionId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, objectif:objectifs(*), athletes:athletes(*), session_exercises:session_exercises(*, exercise:exercices_library(*))')
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

  // Créer la séance
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      title: sessionData.title,
      description: sessionData.description,
      athlete_id: sessionData.athlete_id,
      objectif_id: sessionData.objectif_id,
      date: sessionData.date,
      duration: sessionData.duration,
      main_rounds: sessionData.main_rounds,
      is_template: sessionData.is_template,
      status: sessionData.status || "prévu",
      session_number: sessionData.session_number
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Créer les exercices associés
  if (sessionData.exercises && sessionData.exercises.length > 0) {
    const exercisesToInsert = sessionData.exercises.map(ex => ({
      session_id: session.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets || 1,
      reps: ex.reps,
      weight: ex.weight,
      rest_time: ex.rest_time,
      order_index: ex.order_index,
      notes: ex.notes,
      intensity: ex.intensity,
      section: ex.section
    }));

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert);

    if (exercisesError) throw exercisesError;
  }

  return session;
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

  // Mettre à jour la séance
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .update({
      title: updates.title,
      description: updates.description,
      athlete_id: updates.athlete_id,
      objectif_id: updates.objectif_id,
      date: updates.date,
      duration: updates.duration,
      main_rounds: updates.main_rounds,
      is_template: updates.is_template,
      status: updates.status,
      session_number: updates.session_number
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Mettre à jour les exercices si fournis
  if (updates.exercises) {
    // Supprimer les anciens exercices
    const { error: deleteError } = await supabase
      .from('session_exercises')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    // Ajouter les nouveaux exercices
    if (updates.exercises.length > 0) {
      const exercisesToInsert = updates.exercises.map(ex => ({
        session_id: sessionId,
        exercise_id: ex.exercise_id,
        sets: ex.sets || 1,
        reps: ex.reps,
        weight: ex.weight,
        rest_time: ex.rest_time,
        order_index: ex.order_index,
        notes: ex.notes,
        intensity: ex.intensity,
        section: ex.section
      }));

      const { error: insertError } = await supabase
        .from('session_exercises')
        .insert(exercisesToInsert);

      if (insertError) throw insertError;
    }
  }

  return session;
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

  // Récupérer la séance originale avec ses exercices
  const { data: originalSession, error: fetchError } = await supabase
    .from('sessions')
    .select('*, session_exercises:session_exercises(*)')
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
      title: `${originalSession.title} (copie)`,
      description: originalSession.description,
      athlete_id: null, // On ne duplique pas l'athlète
      objectif_id: originalSession.objectif_id,
      date: new Date().toISOString().split('T')[0],
      duration: originalSession.duration,
      main_rounds: originalSession.main_rounds,
      is_template: true, // La duplication crée toujours un modèle
      status: "prévu",
      session_number: originalSession.objectif_id ? nextNumber : null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Dupliquer les exercices
  if (originalSession.session_exercises && originalSession.session_exercises.length > 0) {
    const exercisesToInsert = originalSession.session_exercises.map(ex => ({
      session_id: newSession.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets || 1,
      reps: ex.reps,
      weight: ex.weight,
      rest_time: ex.rest_time,
      order_index: ex.order_index,
      notes: ex.notes,
      intensity: ex.intensity,
      section: ex.section
    }));

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert);

    if (exercisesError) throw exercisesError;
  }

  return newSession;
}

/**
 * Transmet une séance à l'athlète.
 * @param {string} sessionId - UUID de la séance.
 * @returns {Promise<{success: boolean, error?: string}>} - Résultat de l'opération.
 */
export async function transmitSession(sessionId) {
  const supabase = await createClient();

  try {
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw fetchError;
    if (!session) throw new Error('Séance non trouvée');

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'transmis' })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
