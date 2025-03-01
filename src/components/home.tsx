import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "/components/ui"

interface Chatbot {
  id: number
  name: string
  description: string
}

export default function Home() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null)

  useEffect(() => {
    // Mặc định các chatbot tích hợp sẵn
    const defaultChatbots: Chatbot[] = [
      { id: 1, name: "Chatbot 1", description: "Mô tả Chatbot 1" },
      { id: 2, name: "Chatbot 2", description: "Mô tả Chatbot 2" },
      { id: 3, name: "Chatbot 3", description: "Mô tả Chatbot 3" },
    ]
    setChatbots(defaultChatbots)
    localStorage.setItem('chatbots', JSON.stringify(defaultChatbots))
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Danh Sách Chatbot</h1>
      <div className="space-y-4">
        {chatbots.map((chatbot) => (
          <Card key={chatbot.id} className="cursor-pointer" onClick={() => setSelectedChatbot(chatbot.id)}>
            <CardHeader>
              <CardTitle>{chatbot.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{chatbot.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedChatbot && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">Bạn đã chọn: {chatbots.find((chatbot) => chatbot.id === selectedChatbot)?.name}</h2>
          <Button onClick={() => setSelectedChatbot(null)}>Hủy Chọn</Button>
        </div>
      )}
    </div>
  )
}