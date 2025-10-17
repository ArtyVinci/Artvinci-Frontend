import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chatbot with greeting when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChatbot();
    }
  }, [isOpen]);

  const initializeChatbot = async () => {
    try {
      setIsTyping(true);
      const response = await eventService.sendChatbotMessage({
        message: '__greeting__',
        context: {}
      });

      setMessages([
        {
          type: 'bot',
          text: response.text,
          events: response.events || [],
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      setMessages([
        {
          type: 'bot',
          text: "Bonjour 👋 ! Je suis votre assistant pour découvrir des événements. Comment puis-je vous aider ?",
          events: [],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send to backend
      const response = await eventService.sendChatbotMessage({
        message: userMessage,
        context: {}
      });

      // Add bot response
      const botMessage = {
        type: 'bot',
        text: response.text,
        events: response.events || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: "Désolé, je n'ai pas pu traiter votre message. Pouvez-vous réessayer ?",
          events: [],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEventClick = (eventSlug) => {
    navigate(`/events/${eventSlug}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-[#2d2a27] rounded-2xl shadow-2xl border border-[#e8e7e5] dark:border-[#4a4642] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Assistant ArtVinci</h3>
                  <p className="text-xs opacity-90">Découvrez des événements</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafaf9] dark:bg-[#1a1816]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white dark:bg-[#2d2a27] text-[#2d2a27] dark:text-[#fafaf9] border border-[#e8e7e5] dark:border-[#4a4642]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                    {/* Event Cards */}
                    {message.events && message.events.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.events.map((event, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleEventClick(event.slug)}
                            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-xl cursor-pointer hover:shadow-md transition-all border border-purple-200 dark:border-purple-800"
                          >
                            <h4 className="font-bold text-sm text-purple-900 dark:text-purple-300 mb-1">
                              {event.title}
                            </h4>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                              {event.short_description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-700 dark:text-purple-400">
                                📅 {event.start_date}
                              </span>
                              <span className="text-pink-700 dark:text-pink-400">
                                📍 {event.location}
                              </span>
                            </div>
                            {event.is_free ? (
                              <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                                ✨ Gratuit
                              </div>
                            ) : (
                              <div className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                💰 {event.ticket_price} DT
                              </div>
                            )}
                            <div className="mt-2 text-xs text-center text-purple-600 dark:text-purple-400 font-medium">
                              Cliquez pour voir les détails →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-2xl p-3 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      En train d'écrire...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#2d2a27] border-t border-[#e8e7e5] dark:border-[#4a4642]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#2d2a27] dark:text-[#fafaf9] text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
