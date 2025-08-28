"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ConceptFormModalProps {
  userId: string
  onConceptCreated?: () => void
}

export function ConceptFormModal({ userId, onConceptCreated }: ConceptFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    dueDate: undefined as Date | undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true)
    }

    window.addEventListener("openConceptModal", handleOpenModal)
    return () => window.removeEventListener("openConceptModal", handleOpenModal)
  }, [])

  const categories = [
    "Work",
    "Personal",
    "Learning",
    "Health",
    "Finance",
    "Creative",
    "Technology",
    "Business",
    "Other",
  ]

  const priorities = [
    { value: "low", label: "Low", color: "text-green-500" },
    { value: "medium", label: "Medium", color: "text-yellow-500" },
    { value: "high", label: "High", color: "text-orange-500" },
    { value: "urgent", label: "Urgent", color: "text-red-500" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("concepts").insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        priority: formData.priority,
        due_date: formData.dueDate?.toISOString() || null,
        user_id: userId,
        status: "pending",
      })

      if (error) throw error

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "",
        dueDate: undefined,
      })
      setErrors({})
      setIsOpen(false)
      onConceptCreated?.()
    } catch (error) {
      console.error("Error creating concept:", error)
      setErrors({ submit: "Failed to create concept. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create New Concept
          </DialogTitle>
          <DialogDescription>Add a new micro concept to track and manage your ideas effectively.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter concept title..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={cn("transition-all duration-200", errors.title && "border-destructive")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your concept in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[100px] transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={cn("transition-all duration-200", errors.category && "border-destructive")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger className={cn("transition-all duration-200", errors.priority && "border-destructive")}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-200",
                    !formData.dueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="transition-all duration-200 hover:scale-105 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Concept"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
