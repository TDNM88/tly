mport { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "/components/ui"

interface Chatbot {
  id: number
  name: string
  description: string
}

export default function ChatbotManager() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null)

  useEffect(() => {
    const storedChatbots = localStorage.getItem('chatbots')
    if (storedChatbots) {
      setChatbots(JSON.parse(storedChatbots))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chatbots', JSON.stringify(chatbots))
  }, [chatbots])

  const addChatbot = () => {
    if (name.trim() === '') return
    const newChatbot: Chatbot = {
      id: chatbots.length + 1,
      name,
      description,
    }
    setChatbots([...chatbots, newChatbot])
    setName('')
    setDescription('')
  }

  const editChatbot = (id: number) => {
    const chatbotIndex = chatbots.findIndex((chatbot) => chatbot.id === id)
    if (chatbotIndex === -1) return
    const updatedChatbots = [...chatbots]
    updatedChatbots[chatbotIndex] = {
      id,
      name,
      description,
    }
    setChatbots(updatedChatbots)
    setName('')
    setDescription('')
    setSelectedChatbot(null)
  }

  const deleteChatbot = (id: number) => {
    setChatbots(chatbots.filter((chatbot) => chatbot.id !== id))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Quản Lý Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên Chatbot"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả Chatbot"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={addChatbot}>Thêm Chatbot</Button>
          <Button onClick={() => editChatbot(selectedChatbot!)} disabled={!selectedChatbot}>
            Chỉnh Sửa Chatbot
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chatbots">Chọn Chatbot</Label>
          <Select onValueChange={(value) => setSelectedChatbot(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn một chatbot" />
            </SelectTrigger>
            <SelectContent>
              {chatbots.map((chatbot) => (
                <SelectItem key={chatbot.id} value={String(chatbot.id)}>
                  {chatbot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {selectedChatbot && (
            <div>
              <h3 className="text-lg font-semibold">Chatbot Đã Chọn: {chatbots.find((chatbot) => chatbot.id === selectedChatbot)?.name}</h3>
              <p>{chatbots.find((chatbot) => chatbot.id === selectedChatbot)?.description}</p>
              <Button variant="destructive" onClick={() => deleteChatbot(selectedChatbot)}>
                Xóa Chatbot
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}