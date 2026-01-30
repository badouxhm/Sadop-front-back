// components/types.ts
export interface Chat {
  id: string
  title: string
  active: boolean
  content: string
}

export interface Message {
  role: "user" | "assistant"
  content: string
}
