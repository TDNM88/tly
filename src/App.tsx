import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/home'
import ChatbotManager from './components/chatbot-manager'
import ChatInterface from './components/chat-interface'
import Navigation from './components/navigation'

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