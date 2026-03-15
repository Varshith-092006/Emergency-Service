import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const N8N_WEBHOOK_URL = "https://varshith09.app.n8n.cloud/webhook/chatbot";
// Generate a random ID once per session so n8n remembers the chat history
const sessionId = uuidv4();

const N8nChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am your Emergency Nav Assistant. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const userToken = localStorage.getItem('token');
      
      const res = await axios.post(N8N_WEBHOOK_URL, {
        message: userMsg,
        sessionId: sessionId,
        token: userToken
      });

      let responseText = "";
      const responseData = res.data;

      // Check for array with navigation output, e.g. [{ "output": { "action": "navigate", "route": "/services" } }]
      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];
        if (firstItem.output && firstItem.output.action === "navigate" && firstItem.output.route) {
          setTimeout(() => navigate(firstItem.output.route), 1500);
          responseText = "Navigating you there...";
        } else {
          // If it's another kind of array, try to extract text
          responseText = firstItem.output || firstItem.text || firstItem.message || JSON.stringify(firstItem);
        }
      } else if (typeof responseData === "object" && responseData !== null) {
        // Check for direct object with navigation output
        if (responseData.output && responseData.output.action === "navigate" && responseData.output.route) {
          setTimeout(() => navigate(responseData.output.route), 1500);
          responseText = "Navigating you there...";
        } else {
          // Common keys for n8n responses
          responseText = responseData.output || responseData.text || responseData.message || responseData.response || JSON.stringify(responseData);
        }
      } else {
        // Fallback for primitive types (string)
        responseText = String(responseData || "");
      }

      // Fallback for text-based navigation: [NAVIGATE:/path]
      if (typeof responseText === 'string') {
        const navMatch = responseText.match(/\[NAVIGATE:(\/[a-zA-Z0-9_-]+)\]/i);
        if (navMatch) {
          const targetPage = navMatch[1];
          responseText = responseText.replace(navMatch[0], '').trim() || "Navigating...";
          setTimeout(() => navigate(targetPage), 1500);
        }
      }

      // Convert response to string if it's somehow still an object
      if (typeof responseText !== 'string') {
        responseText = JSON.stringify(responseText);
      }

      if (responseText) {
        setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
      }
    } catch (err) {
      console.error("Chat Error", err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to the emergency assistant." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl mb-4 flex flex-col border border-gray-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm
                    ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }
                  `}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for help..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full shadow-sm transform transition hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 group"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      )}
    </div>
  );
};

export default N8nChatWidget;
