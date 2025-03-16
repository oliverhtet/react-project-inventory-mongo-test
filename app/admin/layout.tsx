import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken, isAdmin } from "@/lib/auth"
import AdminSidebar from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication and admin status on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/login?redirect=/admin/dashboard")
  }

  const tokenData = verifyToken(token)
  if (!tokenData.success || tokenData.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main>{children}</main>
      </div>
    </div>
  )
}
