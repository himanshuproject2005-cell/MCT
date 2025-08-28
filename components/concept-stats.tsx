"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertTriangle, Target } from "lucide-react"

interface Concept {
  id: string
  title: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
}

interface ConceptStatsProps {
  concepts: Concept[]
}

export function ConceptStats({ concepts }: ConceptStatsProps) {
  const stats = {
    total: concepts.length,
    completed: concepts.filter((c) => c.status === "completed").length,
    inProgress: concepts.filter((c) => c.status === "in_progress").length,
    pending: concepts.filter((c) => c.status === "pending").length,
    urgent: concepts.filter((c) => c.priority === "urgent").length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">Finished concepts</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">Active concepts</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{stats.urgent}</div>
          <p className="text-xs text-muted-foreground">High priority items</p>
        </CardContent>
      </Card>
    </div>
  )
}
