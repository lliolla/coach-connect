// ... (toutes les autres parties du fichier restent inchangées)

const handleSubmit = async () => {
  const isTemplateToSave = isCreation ? !effectiveIsTracking : formData.is_template;

  if (!formData.title) {
    toast.error("Le nom du programme est obligatoire");
    return;
  }

  if (!isTemplateToSave && !formData.athlete_id) {
    toast.error("Veuillez sélectionner un athlète");
    return;
  }

  if (formData.exercises.length === 0) {
    toast.error("Ajoutez au moins un exercice");
    return;
  }

  // Vérifier si le nombre max de séances pour l'objectif est atteint
  if (isCreation && formData.objectif_id && !isTemplateToSave) {
    try {
      const isFull = await isObjectifFull(formData.objectif_id);
      if (isFull) {
        setShowMaxSessionsModal(true);
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'objectif:", error);
      toast.error("Erreur lors de la vérification de l'objectif");
      return;
    }
  }

  for (const [index, ex] of formData.exercises.entries()) {
    if (!ex.exercise_id && !ex.template_id) {
      toast.error(`Exercice ${index + 1} : ID manquant`);
      return;
    }
  }

  const loadingToast = toast.loading(isTemplateToSave ? "Enregistrement du modèle..." : "Enregistrement de la séance...")

  try {
    const mappedExercises = formData.exercises.map((ex, index) => ({
      exercise_id: ex.exercise_id || ex.template_id,
      sets: ex.sets || 1,
      reps: ex.reps || 0,
      weight: ex.weight || 0,
      rest_time: ex.rest_time_seconds || 60,
      order_index: index,
      notes: ex.notes || "",
      intensity: ex.intensity || 0,
      section: ex.section || 'main',
      rounds: ex.rounds || 1
    }))

    const payload = {
      title: formData.title,
      description: formData.description,
      athlete_id: isTemplateToSave ? null : formData.athlete_id,
      objectif_id: isTemplateToSave ? null : formData.objectif_id,
      date: formData.date,
      duration: formData.duration,
      main_rounds: parseInt(formData.main_rounds) || 1,
      is_template: isTemplateToSave,
      status: formData.status || "prévu",
      exercises: mappedExercises
    }

    let result;
    if (isCreation) {
      result = await createSession(payload)
    } else {
      result = await updateSession(seanceId, payload)
    }

    if (!result) {
      throw new Error('Erreur lors de la sauvegarde');
    }

    toast.success(isTemplateToSave ? "Modèle enregistré !" : "Séance enregistrée !", { id: loadingToast })

    setTimeout(() => {
      if (context === 'seances') {
        router.push(`/admin/seances/${result.id}?mode=view`)
      } else {
        router.push(`/admin/modeles/${result.id}?mode=view`)
      }
    }, 1500)

  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
    toast.error(`Erreur : ${error.message}`, { id: loadingToast })
  }
}

// ... (toutes les autres parties du fichier restent inchangées)
