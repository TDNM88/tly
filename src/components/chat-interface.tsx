import { useState, useEffect } from 'react'
import { Button } from "/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Input } from "/components/ui/input"
import { Label } from "/components/ui/label"
import { Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "/components/ui/avatar"

interface Message {
  id: number
  sender: 'user' | 'assistant'
  content: string
  file?: string
}

export default function ChatInterface({ chatbotId }: { chatbotId: number }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [messageId, setMessageId] = useState(0)

  const sendMessage = async () => {
    if (input.trim() === '' && !file) return

    const newMessage: Message = {
      id: messageId,
      sender: 'user',
      content: input.trim(),
      file: fileUrl || undefined,
    }

    setMessages([...messages, newMessage])
    setInput('')
    setFile(null)
    setFileUrl(null)
    setMessageId(messageId + 1)

    // Simulate assistant response using API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, chatbotId }),
      })
      const data = await response.json()
      const assistantMessage: Message = {
        id: messageId + 1,
        sender: 'assistant',
        content: data.response,
      }
      setMessages((prevMessages) => [...prevMessages, assistantMessage])
      setMessageId(messageId + 2)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileUrl(URL.createObjectURL(selectedFile))
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Giao Diện Trò Chuyện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <Avatar>
                  <AvatarImage src="https://github.com/nutlope.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`p-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
                {message.file && (
                  <div className="mt-2">
                    <a href={message.file} target="_blank" rel="noopener noreferrer">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    </a>
                  </div>
                )}
              </div>
              {message.sender === 'user' && (
                <Avatar>
                  <AvatarImage src="https://github.com/nutlope.png" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
          />
          <Input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline">
              <Upload className="w-4 h-4" />
            </Button>
          </label>
          <Button onClick={sendMessage}>Gửi</Button>
        </div>
      </CardContent>
    </Card>
  )
}