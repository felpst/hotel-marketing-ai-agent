import { useState, useRef, useEffect, ReactNode } from 'react';
import Message from './Message';
import { processUserMessage } from '../services/api';

interface ChatMessage {
  content: string | ReactNode;
  isUser: boolean;
  timestamp: string;
  isInitialMessage?: boolean;
  showOptions?: boolean;
}

interface ConversationState {
  flow: 'initial' | 'generate' | 'optimize';
  collectedData: {
    hotelName?: string;
    hotelUrl?: string;
    metrics?: {
      CTR?: number;
      ROAS?: number;
      currentBudget?: number;
    };
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    flow: 'initial',
    collectedData: {}
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    const initialMessage: ChatMessage = {
      content: "👋 Hi! I'm your Hotel Marketing Assistant. What would you like to do?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isInitialMessage: true
    };
    setMessages([initialMessage]);
  }, []);

  const addOptionsMessage = () => {
    const optionsMessage: ChatMessage = {
      content: "Would you like to generate another campaign or optimize this one?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isInitialMessage: true
    };
    setMessages(prev => [...prev, optionsMessage]);
  };

  const handleOptionSelect = async (option: 'generate' | 'optimize') => {
    const userMessage: ChatMessage = {
      content: option === 'generate' ? 'Generate a new campaign' : 'Optimize existing campaign',
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { response, nextState } = await processUserMessage(
        option === 'generate' ? 'generate' : 'optimize',
        conversationState
      );
      
      const botMessage: ChatMessage = {
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationState(nextState);
      
      // Only add options message if we're not starting a new flow
      if (nextState.flow === 'initial') {
        setTimeout(addOptionsMessage, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message || 'Something went wrong. Please try again.');
      
      const errorMessage: ChatMessage = {
        content: (error as Error).message || 'Something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationState({ flow: 'initial', collectedData: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const { response, nextState } = await processUserMessage(inputValue, conversationState);
      
      const botMessage: ChatMessage = {
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setConversationState(nextState);
      
      // Only add options message if we've completed a flow and received results
      if (nextState.flow === 'initial' && response && typeof response !== 'string') {
        setTimeout(addOptionsMessage, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message || 'Something went wrong. Please try again.');
      
      const errorMessage: ChatMessage = {
        content: (error as Error).message || 'Something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setConversationState({ flow: 'initial', collectedData: {} });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex-none p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Hotel Marketing Assistant</h2>
        <p className="text-sm text-gray-600">Ask me anything about hotel marketing campaigns</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isInitialMessage={message.isInitialMessage}
            onOptionSelect={message.isInitialMessage || message.showOptions ? handleOptionSelect : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-bounce">●</div>
            <div className="animate-bounce delay-100">●</div>
            <div className="animate-bounce delay-200">●</div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm p-2 rounded bg-red-50">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex-none p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              conversationState.flow === 'initial'
                ? "Please select an option above..."
                : conversationState.flow === 'generate'
                ? !conversationState.collectedData.hotelName
                  ? "Enter your hotel name..."
                  : "Enter your hotel website URL..."
                : "Enter the requested metric..."
            }
            className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 