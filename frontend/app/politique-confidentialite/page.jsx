export default function PolitiqueConfidentialite() {
  return (
    <div className="container mx-auto py-12 px-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <p className="text-sm text-muted-foreground mb-4">Dernière mise à jour : 8 mai 2026</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Collecte des données</h2>
        <p>
          Nous collectons uniquement les informations nécessaires au fonctionnement de votre espace Prep Athlete (nom, prénom, email, données de séances). Ces données sont fournies directement par vous ou par votre administrateur.
        </p>
        
        <h2 className="text-xl font-semibold">2. Utilisation des données</h2>
        <p>
          Vos données sont utilisées exclusivement pour le suivi de vos programmes d'entraînement et la gestion de votre abonnement. Aucune donnée n'est vendue à des tiers.
        </p>
        
        <h2 className="text-xl font-semibold">3. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité conformes aux standards pour protéger vos données contre tout accès non autorisé.
        </p>
        
        <h2 className="text-xl font-semibold">4. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez l'administrateur de votre compte.
        </p>
      </section>
    </div>
  )
}
