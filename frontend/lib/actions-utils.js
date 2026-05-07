/**
 * Helper pour synchroniser les relations many-to-many
 * Utilisé dans les Server Actions pour Athlètes, etc.
 */
export async function syncManyToMany(supabase, athleteId, joinTable, lookupTable, lookupField, items, fkColumn) {
  if (!items || !Array.isArray(items)) return

  try {
    // 1. Supprimer les liens existants
    await supabase.from(joinTable).delete().eq('athlete_id', athleteId)

    if (items.length === 0) return

    // 2. S'assurer que tous les items existent dans la table de référence
    for (const itemValue of items) {
      await supabase.from(lookupTable).upsert([{ [lookupField]: itemValue }], { onConflict: lookupField })
    }

    // 3. Récupérer les IDs pour les labels fournis
    const { data: lookups } = await supabase
      .from(lookupTable)
      .select(`id, ${lookupField}`)
      .in(lookupField, items)

    if (lookups && lookups.length > 0) {
      const inserts = lookups.map(item => ({
        athlete_id: athleteId,
        [fkColumn]: item.id
      }))
      const { error } = await supabase.from(joinTable).insert(inserts)
      if (error) throw error
    }
  } catch (err) {
    console.error(`[ERROR] syncManyToMany failed for ${joinTable}:`, err)
    throw err
  }
}

/**
 * Helper pour transformer une valeur en nombre ou null/0 pour PostgreSQL
 */
export const toNumeric = (val, defaultValue = 0) => {
  if (val === undefined || val === null || val === "") return defaultValue;
  const parsed = parseFloat(val.toString().replace(',', '.'));
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Helper pour mapper les exercices vers le format DB
 */
export const mapExercises = (exercises, sessionId) => {
  return exercises
    .map((ex, index) => {
      const exerciseId = ex.exercise_id || ex.template_id || ex.id;
      
      if (!exerciseId) {
        console.warn(`[WARN] Exercice à l'index ${index} ignoré car l'ID est manquant`);
        return null;
      }

      return {
        session_id: sessionId,
        exercise_id: exerciseId,
        sets: 1,
        reps: Math.round(toNumeric(ex.reps, 0)),
        weight: toNumeric(ex.weight, 0),
        order_index: ex.order_index !== undefined ? parseInt(ex.order_index) : index,
        rest_time: Math.round(toNumeric(ex.rest_time || ex.rest_time_seconds, 60)),
        notes: ex.notes || "",
        intensity: ex.intensity ? toNumeric(ex.intensity, 0).toString() : null,
        section: ex.section || 'main'
      };
    })
    .filter(ex => ex !== null);
}
