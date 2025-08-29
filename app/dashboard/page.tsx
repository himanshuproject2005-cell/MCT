import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ConceptStats } from "@/components/concept-stats"
import { ConceptList } from "@/components/concept-list"
import { ChatBot } from "@/components/chat-bot"
import { ConceptFormModal } from "@/components/concept-form-modal"

export default async function DashboardPage() {
  console.log("[v0] Dashboard page loading...")

  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    const { data, error } = await supabase.auth.getUser()
    console.log("[v0] User auth check:", { hasUser: !!data?.user, error: error?.message })

    if (error || !data?.user) {
      console.log("[v0] No user found, redirecting to login")
      redirect("/auth/login")
    }

    let concepts = []
    let profile = null

    try {
      console.log("[v0] Fetching concepts for user:", data.user.id)
      const { data: conceptsData, error: conceptsError } = await supabase
        .from("concepts")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })

      if (conceptsError) {
        console.log("[v0] Concepts fetch error:", conceptsError.message)
      } else {
        concepts = conceptsData || []
        console.log("[v0] Concepts fetched:", concepts.length)
      }
    } catch (err) {
      console.log("[v0] Concepts table might not exist:", err)
    }

    try {
      console.log("[v0] Fetching profile for user:", data.user.id)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.log("[v0] Profile fetch error:", profileError.message)
      } else {
        profile = profileData
        console.log("[v0] Profile fetched:", !!profile)
      }
    } catch (err) {
      console.log("[v0] Profiles table might not exist:", err)
    }

    console.log("[v0] Rendering dashboard with data")

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <DashboardHeader user={data.user} profile={profile} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
              <ConceptStats concepts={concepts} />
              <ConceptList initialConcepts={concepts} userId={data.user.id} />
            </div>

            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="lg:sticky lg:top-8 overflow-visible">
                <ChatBot userId={data.user.id} />
              </div>
            </div>
          </div>
        </main>

        <ConceptFormModal userId={data.user.id} />
      </div>
    )
  } catch (error) {
    console.log("[v0] Dashboard error:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">Please make sure the database is set up correctly.</p>
          <p className="text-sm text-muted-foreground">Check the console for more details.</p>
        </div>
      </div>
    )
  }
}
