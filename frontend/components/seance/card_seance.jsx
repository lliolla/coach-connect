// ... (début du fichier inchangé)

export const CardSeance = ({
  mode = "create",
  duplicateId = null,
  isTracking = false,
  objectifs = [], // Ajout de la prop par défaut
  seanceId = null,
  context = "seances"
}) => {
  const isCreation = mode === "create"
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showMaxSessionsModal, setShowMaxSessionsModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)
  const [athletes, setAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // Récupération des athlètes
  React.useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const data = await getAthletes()
        setAthletes(data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération des athlètes:", error)
      }
    }
    fetchAthletes()
  }, [])

  // ... (le reste du fichier inchangé, y compris la logique de handleSubmit)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreation ? "Nouvelle séance" : "Modifier la séance"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nom du programme</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Programme de force"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="athlete_id">Athlète</Label>
              <Select
                value={formData.athlete_id || ""}
                onValueChange={(value) => handleChange("athlete_id", value)}
                disabled={formData.is_template}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un athlète" />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      {athlete.first_name} {athlete.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objectif_id">Objectif</Label>
              <Select
                value={formData.objectif_id || ""}
                onValueChange={(value) => handleChange("objectif_id", value)}
                disabled={formData.is_template}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un objectif" />
                </SelectTrigger>
                <SelectContent>
                  {objectifs.map((objectif) => (
                    <SelectItem key={objectif.id} value={objectif.id}>
                      {objectif.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
          </div>

          {/* ... (le reste du fichier inchangé) */}
        </CardContent>
      </Card>

      {/* ... (le reste du fichier inchangé) */}
    </div>
  )
}
