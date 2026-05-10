import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"

export default async function AthleteLayout({ children }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return <>{children}</>
}
