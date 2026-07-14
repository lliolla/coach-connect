import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Rediriger vers le bon dashboard selon le rôle
  if (user.isAdmin) {
    redirect('/admin/dashboard')
  } else {
    redirect('/profile')
  }
}
