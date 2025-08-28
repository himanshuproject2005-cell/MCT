"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Plus, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  user: any
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              MCT
            </h1>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              className="transition-all duration-200 hover:scale-105"
              onClick={() => {
                // This will be handled by the concept form modal
                const event = new CustomEvent("openConceptModal")
                window.dispatchEvent(event)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Concept
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profile?.avatar_url || "/placeholder.svg"}
                      alt={profile?.full_name || user.email}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name ? getInitials(profile.full_name) : user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
