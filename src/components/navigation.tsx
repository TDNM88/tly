import { useState } from 'react'
import { Button } from "/components/ui/button"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-blue-500">
            Chatbot App
          </Link>
        </div>
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="text-gray-700 hover:text-blue-500">Trang Chủ</Link>
          <Link to="/chatbots" className="text-gray-700 hover:text-blue-500">Quản Lý Chatbots</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-500">Về Chúng Tôi</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-500">Liên Hệ</Link>
        </div>
        <div className="md:hidden">
          <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white py-2">
          <Link to="/" className="block px-4 py-2 text-gray-700 hover:text-blue-500">Trang Chủ</Link>
          <Link to="/chatbots" className="block px-4 py-2 text-gray-700 hover:text-blue-500">Quản Lý Chatbots</Link>
          <Link to="/about" className="block px-4 py-2 text-gray-700 hover:text-blue-500">Về Chúng Tôi</Link>
          <Link to="/contact" className="block px-4 py-2 text-gray-700 hover:text-blue-500">Liên Hệ</Link>
        </div>
      )}
    </nav>
  )
}