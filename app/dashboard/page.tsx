import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ConceptStats } from "@/components/concept-stats"
import { ConceptList } from "@/components/concept-list"
import { ChatBot } from "@/components/chat-bot"
import { ConceptFormModal } from "@/components/concept-form-modal"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's concepts
  const { data: concepts } = await supabase
    .from("concepts")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <DashboardHeader user={data.user} profile={profile} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            <ConceptStats concepts={concepts || []} />
            <ConceptList initialConcepts={concepts || []} userId={data.user.id} />
          </div>

          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-8">
              <ChatBot userId={data.user.id} />
            </div>
          </div>
        </div>
      </main>

      <ConceptFormModal userId={data.user.id} />
    </div>
  )
}
