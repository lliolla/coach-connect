import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm({ className, ...props }) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Entrez vos informations ci-dessous pour créer votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" type="text" placeholder="Jean Dupont" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Nous utiliserons cet email pour vous contacter.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required />
              <p className="text-xs text-muted-foreground">
                Doit contenir au moins 8 caractères.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirmer le mot de passe
              </Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Créer le compte
            </Button>
            <Button variant="outline" type="button" className="w-full">
              S'inscrire avec Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="underline underline-offset-4">
              Se connecter
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
