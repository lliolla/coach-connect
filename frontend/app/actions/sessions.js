// Dans updateSession, après la vérification du changement d'objectif_id :
if (currentSession.objectif_id && updates.objectif_id === null) {
  // Retirer la séance de l'objectif et renuméroter les autres
  await supabase.rpc('delete_session_and_renumber', {
    p_session_id: sessionId,
  });
}
