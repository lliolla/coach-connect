import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"

export default async function AdminLayout({ children }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  if (!user.isAdmin) {
    redirect("/profile")
  }

  return <>{children}</>
}
