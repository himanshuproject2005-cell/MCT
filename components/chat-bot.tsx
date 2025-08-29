"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Plus, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  suggestions?: string[]
}

interface Concept {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  priority: string
}

interface ChatBotProps {
  userId?: string
}

export function ChatBot({ userId }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your MCT assistant. I can help you organize concepts, suggest priorities, create new concepts, and provide productivity tips. What would you like to work on today?",
      role: "assistant",
      timestamp: new Date(),
      suggestions: ["Create a new concept", "Review my priorities", "Get productivity tips", "Organize my concepts"],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [concepts, setConcepts] = useState<Concept[]>([])
  const supabase = createClient()
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (userId) {
      fetchConcepts()
    }
  }, [userId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  const fetchConcepts = async () => {
    if (!userId) return

    const { data } = await supabase
      .from("concepts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (data) {
      setConcepts(data)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          concepts: concepts.slice(0, 10),
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`)
      }

      const body = response.body
      if (!body) {
        throw new Error("No response body")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      const reader = body.getReader()
      const decoder = new TextDecoder()
      try {
        // read until done
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (chunk) {
            assistantMessage.content += chunk
            setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
          }
        }
      } finally {
        try {
          reader.releaseLock()
        } catch {}
      }

      // Optional lightweight suggestion inference
      const lower = assistantMessage.content.toLowerCase()
      if (lower.includes("create") && lower.includes("concept")) {
        assistantMessage.suggestions = ["Create this concept", "Tell me more", "What's next?"]
        setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Create a new concept" || suggestion === "Create this concept") {
      const event = new CustomEvent("openConceptModal")
      window.dispatchEvent(event)
    } else {
      setInput(suggestion)
    }
  }

  const quickActions = [
    { label: "New Concept", icon: Plus, action: () => window.dispatchEvent(new CustomEvent("openConceptModal")) },
    { label: "Get Tips", icon: Lightbulb, action: () => setInput("Give me productivity tips for managing concepts") },
  ]

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px] lg:h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-base lg:text-lg">MCT Assistant</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {concepts.length} concepts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 p-3 lg:p-4 min-h-0">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-105 bg-transparent"
            >
              <action.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto pr-2 lg:pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] lg:max-w-[80%] p-2 lg:p-3 rounded-lg text-xs lg:text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 lg:w-4 lg:h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>

                {message.suggestions && message.role === "assistant" && (
                  <div className="flex flex-wrap gap-2 ml-8 lg:ml-10">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs transition-all duration-200 hover:scale-105"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
                </div>
                <div className="bg-muted text-muted-foreground p-2 lg:p-3 rounded-lg text-xs lg:text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} className="h-0" />
          </div>
        </ScrollArea>

        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm" className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
