'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { resetPasswordForEmail } from "@/app/actions/auth"

export default function ForgotPasswordPage({ className }) {
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await resetPasswordForEmail(email)
    
    if (result.success) {
      toast.success("Si cet email existe, un lien de réinitialisation a été envoyé.")
    } else {
      toast.error(result.error || "Une erreur est survenue lors de l'envoi de l'email.")
    }
    
    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-svh p-6 md:p-10", className)}>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
              <p className="text-sm text-muted-foreground">
                Entrez votre email pour recevoir les instructions de réinitialisation.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer les instructions"}
              </Button>
            </div>
            
            <div className="text-center text-sm">
              <a href="/login" className="underline underline-offset-4">
                Retour à la connexion
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
