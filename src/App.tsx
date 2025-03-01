import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from '/src/components/home'
import ChatbotManager from '/src/components/chatbot-manager'
import ChatInterface from '/src/components/chat-interface'
import { Button } from '/src/components/ui/button';

<Button variant="default" size="sm">
  Click me
</Button>

export default function App() {
  return (
    <Router>
      <Navigation />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbots" element={<ChatbotManager />} />
          <Route path="/chat/:chatbotId" element={<ChatInterface chatbotId={1} />} />
          <Route path="/about" element={<div className="text-2xl font-bold">Trang Về Chúng Tôi</div>} />
          <Route path="/contact" element={<div className="text-2xl font-bold">Trang Liên Hệ</div>} />
        </Routes>
      </div>
    </Router>
  )
}