"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, Trash2, RefreshCw } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface Concept {
  id: string
  title: string
  description: string | null
  category: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  due_date: string | null
  created_at: string
  updated_at: string
}

interface ConceptListProps {
  initialConcepts: Concept[]
  userId: string
}

export function ConceptList({ initialConcepts, userId }: ConceptListProps) {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = createClient()
      setSupabase(client)
    }
  }, [])

  useEffect(() => {
    setConcepts(initialConcepts)
  }, [initialConcepts])

  const refreshConcepts = async () => {
    if (!supabase) return

    setIsRefreshing(true)
    try {
      console.log("[v0] Refreshing concepts...")
      const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setConcepts(data || [])
      console.log("[v0] Concepts refreshed:", data?.length || 0)
    } catch (error) {
      console.error("[v0] Error refreshing concepts:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!supabase || typeof window === "undefined") return

    console.log("[v0] Setting up real-time subscription...")

    try {
      const channel = supabase
        .channel("concepts-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "concepts",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("[v0] Real-time update received:", payload.eventType)
            if (payload.eventType === "INSERT") {
              setConcepts((prev) => [payload.new as Concept, ...prev])
            } else if (payload.eventType === "UPDATE") {
              setConcepts((prev) =>
                prev.map((concept) => (concept.id === payload.new.id ? (payload.new as Concept) : concept)),
              )
            } else if (payload.eventType === "DELETE") {
              setConcepts((prev) => prev.filter((concept) => concept.id !== payload.old.id))
            }
            setTimeout(refreshConcepts, 1000)
          },
        )
        .subscribe((status) => {
          console.log("[v0] Subscription status:", status)
        })

      const handleRefresh = () => {
        refreshConcepts()
      }
      window.addEventListener("refreshConcepts", handleRefresh)

      return () => {
        console.log("[v0] Cleaning up subscription...")
        supabase.removeChannel(channel)
        window.removeEventListener("refreshConcepts", handleRefresh)
      }
    } catch (error) {
      console.error("[v0] Error setting up real-time subscription:", error)
    }
  }, [supabase, userId])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "pending":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const updateConceptStatus = async (conceptId: string, newStatus: string) => {
    if (!supabase) return

    try {
      console.log("[v0] Updating concept status:", conceptId, newStatus)
      const { error } = await supabase
        .from("concepts")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", conceptId)

      if (error) throw error

      setTimeout(refreshConcepts, 500)
    } catch (error) {
      console.error("[v0] Error updating concept:", error)
    }
  }

  const deleteConcept = async (conceptId: string) => {
    if (!supabase) return

    try {
      console.log("[v0] Deleting concept:", conceptId)
      const { error } = await supabase.from("concepts").delete().eq("id", conceptId)
      if (error) throw error

      setTimeout(refreshConcepts, 500)
    } catch (error) {
      console.error("[v0] Error deleting concept:", error)
    }
  }

  if (concepts.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No concepts yet</h3>
              <p className="text-muted-foreground">Create your first micro concept to get started</p>
            </div>
            <Button
              onClick={() => {
                const event = new CustomEvent("openConceptModal")
                window.dispatchEvent(event)
              }}
              className="transition-all duration-200 hover:scale-105"
            >
              Create Concept
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Concepts</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {concepts.length} total
          </Badge>
          <Button variant="ghost" size="sm" onClick={refreshConcepts} disabled={isRefreshing} className="h-8 w-8 p-0">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className="relative z-10 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] overflow-visible"
          >
            <CardHeader className="pb-3 overflow-visible">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">{concept.title}</CardTitle>
                  {concept.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{concept.description}</p>
                  )}
                  {concept.due_date && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Due: {format(new Date(concept.due_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 hover:bg-muted/50 relative z-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuPortal forceMount>
                    <DropdownMenuContent
                      align="end"
                      side="bottom"
                      sideOffset={8}
                      collisionPadding={12}
                      className="w-48 z-[9999] will-change-transform"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          updateConceptStatus(concept.id, "pending")
                        }}
                      >
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          updateConceptStatus(concept.id, "in_progress")
                        }}
                      >
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          updateConceptStatus(concept.id, "completed")
                        }}
                      >
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Are you sure you want to delete this concept?")) {
                            deleteConcept(concept.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className={getPriorityColor(concept.priority)}>{concept.priority}</Badge>
                  <Badge className={getStatusColor(concept.status)}>{concept.status.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {concept.category}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  {formatDistanceToNow(new Date(concept.created_at), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
