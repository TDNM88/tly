import React, { useState, useEffect, useCallback } from 'react';

interface ChatbotConfig {
  name: string;
  description: string;
  model: string;
  persona: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface Chatbot {
  id: string;
  config: ChatbotConfig;
  messages: { role: 'user' | 'assistant'; content: string; files?: File[] }[];
  profileImage?: string;
}

const defaultChatbots: Chatbot[] = [
  {
    id: 't1',
    config: {
      name: 'Trợ lý Thời tiết',
      description: 'Cung cấp thông tin thời tiết hàng ngày.',
      model: 'mixtral-8x7b-32768',
      persona: 'Bạn là một trợ lý thời tiết hữu ích.',
      temperature: 0.5,
      topP: 0.5,
      maxTokens: 512,
    },
    messages: [],
    profileImage: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 't2',
    config: {
      name: 'Trợ lý Nấu ăn',
      description: 'Đề xuất các công thức nấu ăn ngon.',
      model: 'mixtral-8x7b-32768',
      persona: 'Bạn là một trợ lý nấu ăn sáng tạo.',
      temperature: 0.7,
      topP: 0.7,
      maxTokens: 512,
    },
    messages: [],
    profileImage: 'https://i.pravatar.cc/150?img=2',
  },
];

const App: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [newChatbotConfig, setNewChatbotConfig] = useState<ChatbotConfig>({
    name: '',
    description: '',
    model: 'mixtral-8x7b-32768',
    persona: 'Bạn là một trợ lý hữu ích.',
    temperature: 0.7,
    topP: 0.7,
    maxTokens: 1024,
  });
  const [newMessage, setNewMessage] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'mixtral-8x7b-32768',
    'llama2-70b-4096',
    'gemma-7b-it'
  ]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activePage, setActivePage] = useState<'home' | 'assistants' | 'about' | 'contact'>('home');
  const [isCreating, setIsCreating] = useState(false);

  const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  useEffect(() => {
    const storedChatbots = localStorage.getItem('chatbots');
    if (storedChatbots) {
      setChatbots(JSON.parse(storedChatbots));
    } else {
      setChatbots(defaultChatbots);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbots', JSON.stringify(chatbots));
  }, [chatbots]);

  const handleChatbotSelect = (id: string) => {
    setSelectedChatbotId(id);
  };

  const handleNewChatbotChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setNewChatbotConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCreateChatbot = () => {
    setIsCreating(true);
    const newId = Math.random().toString(36).substring(7);
    const defaultProfileImages = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
      'https://i.pravatar.cc/150?img=5',
    ];
    const randomProfileImage = defaultProfileImages[Math.floor(Math.random() * defaultProfileImages.length)];

    const newChatbot: Chatbot = {
      id: newId,
      config: { ...newChatbotConfig },
      messages: [],
      profileImage: randomProfileImage,
    };
    setChatbots([...chatbots, newChatbot]);
    setNewChatbotConfig({
      name: '',
      description: '',
      model: 'mixtral-8x7b-32768',
      persona: 'Bạn là một trợ lý hữu ích.',
      temperature: 0.7,
      topP: 0.7,
      maxTokens: 1024,
    });
    setIsCreating(false);
  };

  const callGroqApi = useCallback(async (message: string, chatbotConfig: ChatbotConfig) => {
    if (!groqApiKey) {
      console.error('Groq API key is missing. Please set the NEXT_PUBLIC_GROQ_API_KEY environment variable.');
      return 'Error: Groq API key is missing. Please check your .env file.';
    }

    const requestBody = {
      model: chatbotConfig.model,
      messages: [
        {
          role: "system",
          content: chatbotConfig.persona
        },
        {
          role: "user",
          content: message,
        }
      ],
      temperature: chatbotConfig.temperature,
      top_p: chatbotConfig.topP,
      max_tokens: chatbotConfig.maxTokens,
    };

    try {
      const response = await fetch(groqApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`Groq API error: ${response.status} - ${response.statusText}`);
        return `Error: Groq API request failed with status ${response.status}`;
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.error('Groq API response missing choices:', data);
        return 'Error: Groq API response missing data.';
      }
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return `Error: Failed to call Groq API: ${error}`;
    }
  }, [groqApiKey, groqApiUrl]);

  const handleSendMessage = async () => {
    if (!selectedChatbotId) return;
  
    const selectedChatbot = chatbots.find((chatbot) => chatbot.id === selectedChatbotId);
    if (!selectedChatbot) return;
  
    // Gọi API để lấy phản hồi từ chatbot
    const assistantResponse = await callGroqApi(newMessage, selectedChatbot.config);
  
    const updatedChatbots = chatbots.map((chatbot) => {
      if (chatbot.id === selectedChatbotId) {
        const updatedMessages = [
          ...chatbot.messages,
          { 
            role: 'user' as const, 
            content: newMessage, 
            files: selectedFiles 
          },
          { 
            role: 'assistant' as const, 
            content: assistantResponse 
          }
        ];
        return { ...chatbot, messages: updatedMessages };
      }
      return chatbot;
    });
  
    setChatbots(updatedChatbots);
    setNewMessage(''); // Reset input message
    setSelectedFiles([]); // Reset selected files
  };
  const handleDeleteChatbot = (id: string) => {
    setChatbots(chatbots.filter((chatbot) => chatbot.id !== id));
    setSelectedChatbotId(null);
  };

  const handleEditChatbot = (id: string) => {
    const chatbotToEdit = chatbots.find((chatbot) => chatbot.id === id);
    if (chatbotToEdit) {
      setNewChatbotConfig(chatbotToEdit.config);
      setChatbots(chatbots.filter(chatbot => chatbot.id !== id));
    }
    setSelectedChatbotId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>, chatbotId: string) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedChatbots = chatbots.map(chatbot => {
          if (chatbot.id === chatbotId) {
            return { ...chatbot, profileImage: reader.result as string };
          }
          return chatbot;
        });
        setChatbots(updatedChatbots);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tổng quan về Trợ lý</h2>
            <p className="text-gray-700 mb-4">
              Chào mừng bạn đến với nền tảng trợ lý AI của chúng tôi. Dưới đây là danh sách các trợ lý đã được cài đặt sẵn để giúp bạn thực hiện các tác vụ hàng ngày.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((chatbot) => (
                <div
                  key={chatbot.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 ease-in-out"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      {chatbot.profileImage ? (
                        <img
                          src={chatbot.profileImage}
                          alt="Hình đại diện trợ lý"
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 mr-3" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-800">{chatbot.config.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{chatbot.config.description}</p>
                    <div className="flex items-center justify-between">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => handleChatbotSelect(chatbot.id)}
                      >
                        Chat
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChatbot(chatbot.id);
                        }}
                        className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                    <p className="text-gray-500 text-xs">Mô hình: {chatbot.config.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'assistants':
        return (
          <section className="bg-white rounded-lg shadow-md p-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Tạo Trợ lý Mới
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Tên Trợ lý:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newChatbotConfig.name}
                    onChange={handleNewChatbotChange}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="description"
                  >
                    Mô tả:
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newChatbotConfig.description}
                    onChange={handleNewChatbotChange}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="model"
                  >
                    Mô hình:
                  </label>
                  <select
                    id="model"
                    name="model"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newChatbotConfig.model}
                    onChange={handleNewChatbotChange}
                  >
                    <option value="">Chọn mô hình</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="persona"
                  >
                    Tính cách:
                  </label>
                  <textarea
                    id="persona"
                    name="persona"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newChatbotConfig.persona}
                    onChange={handleNewChatbotChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="temperature"
                    >
                      Nhiệt độ:
                    </label>
                    <input
                      type="number"
                      id="temperature"
                      name="temperature"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newChatbotConfig.temperature}
                      onChange={handleNewChatbotChange}
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="topP"
                    >
                      Top P:
                    </label>
                    <input
                      type="number"
                      id="topP"
                      name="topP"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newChatbotConfig.topP}
                      onChange={handleNewChatbotChange}
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="maxTokens"
                    >
                      Số lượng mã thông báo tối đa:
                    </label>
                    <input
                      type="number"
                      id="maxTokens"
                      name="maxTokens"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={newChatbotConfig.maxTokens}
                      onChange={handleNewChatbotChange}
                      min="1"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateChatbot}
                  className={`bg-green-500 text-white p-3 rounded-md hover:bg-green-700 focus:outline-none ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isCreating}
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo Trợ lý'}
                </button>
              </div>
            </div>
          </section>
        );
      case 'about':
        return (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Về Chúng Tôi</h2>
            <p className="text-gray-700">
              Chúng tôi là một nhóm các nhà phát triển đam mê AI và muốn mang đến cho bạn những trợ lý ảo tốt nhất.
            </p>
          </section>
        );
      case 'contact':
        return (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Liên Hệ</h2>
            <p className="text-gray-700">
              Bạn có thể liên hệ với chúng tôi qua email: example@example.com
            </p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-blue-500 py-4 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Nền tảng Trợ lý AI</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <button
                  className={`text-blue-100 hover:text-white focus:outline-none ${activePage === 'home' ? 'font-bold' : ''}`}
                  onClick={() => setActivePage('home')}
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  className={`text-blue-100 hover:text-white focus:outline-none ${activePage === 'assistants' ? 'font-bold' : ''}`}
                  onClick={() => setActivePage('assistants')}
                >
                  Trợ lý
                </button>
              </li>
              <li>
                <button
                  className={`text-blue-100 hover:text-white focus:outline-none ${activePage === 'about' ? 'font-bold' : ''}`}
                  onClick={() => setActivePage('about')}
                >
                  Về Chúng Tôi
                </button>
              </li>
              <li>
                <button
                  className={`text-blue-100 hover:text-white focus:outline-none ${activePage === 'contact' ? 'font-bold' : ''}`}
                  onClick={() => setActivePage('contact')}
                >
                  Liên Hệ
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {renderChatInterface(selectedChatbotId, chatbots, handleSendMessage, newMessage, setNewMessage, selectedFiles, handleFileSelect, groqApiUrl, groqApiKey, callGroqApi, setChatbots)}
        {activePage !== 'assistants' && !selectedChatbotId && renderPageContent()}
        {activePage === 'assistants' && renderPageContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Nền tảng Trợ lý AI. Đã đăng ký bản quyền.</p>
        </div>
      </footer>
    </div>
  );
};

const renderChatInterface = (selectedChatbotId: string | null, chatbots: Chatbot[], handleSendMessage: () => Promise<void>, newMessage: string, setNewMessage: React.Dispatch<React.SetStateAction<string>>, selectedFiles: File[], handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void, apiUrl: string, apiKey: string | undefined, callGroqApi: (message: string, chatbotConfig: ChatbotConfig) => Promise<string>, setChatbots: React.Dispatch<React.SetStateAction<Chatbot[]>>) => {
  if (!selectedChatbotId) return null;

  const selectedChatbot = chatbots.find((chatbot) => chatbot.id === selectedChatbotId);
  if (!selectedChatbot) return null;

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="h-full flex flex-col">
        <div className="flex items-center mb-4">
          {selectedChatbot.profileImage ? (
            <img
              src={selectedChatbot.profileImage}
              alt="Hình đại diện Chatbot"
              className="rounded-full w-12 h-12 object-cover mr-3"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 mr-3" />
          )}
          <h2 className="text-xl font-semibold text-gray-800">
            Chat với {selectedChatbot.config.name}
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto mb-4 p-3 space-y-2">
          {selectedChatbot.messages.map((message, index) => (
            <div
              key={index}
              className={`rounded-md p-3 max-w-fit ${message.role === 'user' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-100 text-gray-800 mr-auto'
                }`}
              style={{ maxWidth: '80%', alignSelf: message.role === 'user' ? 'end' : 'start', textAlign: message.role === 'user' ? 'right' : 'left' }}
            >
              {message.content}
              {message.files && message.files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Tệp:</p>
                  <ul>
                    {message.files.map((file, fileIndex) => (
                      <li key={fileIndex} className="text-sm">
                        {file.name} ({file.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow border rounded-md p-3 mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload" className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 focus:outline-none cursor-pointer mr-2">
            Tệp
          </label>
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Gửi
          </button>
        </div>
        {selectedFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold">Tệp đã chọn:</p>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default App;