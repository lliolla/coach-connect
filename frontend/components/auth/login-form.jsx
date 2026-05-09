'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { login } from "@/app/actions/auth"

export function LoginForm({ className }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({ email: "", password: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success("Connexion réussie")
      router.push(result.isAdmin ? '/dashboard' : '/athletes')
    } else {
      toast.error(result.error || "Erreur de connexion")
    }
    
    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-svh p-6 md:p-10", className)}>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Connexion</h1>
              <p className="text-sm text-muted-foreground">
                Entrez vos identifiants ci-dessous pour vous connecter
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
            
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>

            <Button variant="outline" type="button" className="w-full">
              Se connecter avec GitHub
            </Button>
            
            <div className="text-center text-sm">
              Pas encore de compte ?{" "}
              <a href="/signup" className="underline underline-offset-4">
                S'inscrire
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
