import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

const N8N_WEBHOOK_URL = "https://varshith09.app.n8n.cloud/webhook/chatbot";
// Generate a random ID once per session so n8n remembers the chat history
const sessionId = uuidv4();

const N8nChatWidget = () => {
  const { user } = useAuth();
  const { sendSOSAlert } = useSocket();
  const { theme } = useTheme();
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

  // Helper: wrap geolocation in a Promise so we can use async/await
  const getCurrentPositionAsync = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    );

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const userToken = localStorage.getItem('token');

      let locationData = null;

      if (navigator.geolocation) {
        try {
          const position = await getCurrentPositionAsync();
          const { latitude, longitude, accuracy } = position.coords;

          locationData = {
            coordinates: [longitude, latitude],
            accuracy: accuracy
          };
        } catch (geoErr) {
          console.error("Location error", geoErr);
        }
      }

      // Retrieve user info from useAuth context
      let userId = user ? (user._id || user.id) : null;

      console.log("Extracted userId from useAuth:", userId);

      const res = await axios.post(N8N_WEBHOOK_URL, {
        message: userMsg,
        sessionId: sessionId,
        location: locationData,
        userId: userId,
      },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      let responseText = "";
      const responseData = res.data;

      // DEBUG: Log the raw n8n response
      console.log("===== N8N RAW RESPONSE =====");
      console.log("res.data:", JSON.stringify(responseData, null, 2));
      console.log("typeof responseData:", typeof responseData);

      // Helper: detect SOS intent from user message text
      const isSosRequest = (msg) => {
        const lower = msg.toLowerCase().trim();
        const sosPatterns = [
          /\bsos\b/, /\bsend\s*sos\b/, /\bemergency\s*sos\b/,
          /\bhelp\s*me\b/, /\bi\s*need\s*help\b/, /\bemergency\s*alert\b/,
          /\btrigger\s*sos\b/, /\bdispatch\s*sos\b/, /\bsend\s*alert\b/,
          /\bemergency\b.*\bsend\b/, /\bsend\b.*\bemergency\b/
        ];
        return sosPatterns.some(pattern => pattern.test(lower));
      };

      let actionObj = null;
      let sosBranchHandled = false;

      // Support responses that are either objects or arrays containing objects
      if (Array.isArray(responseData) && responseData.length > 0) {
        actionObj = responseData[0];
      } else if (typeof responseData === "object" && responseData !== null) {
        actionObj = responseData;
      }

      if (actionObj) {
        const payload = actionObj.output || actionObj;

        console.log("Parsed payload:", JSON.stringify(payload, null, 2));

        if (payload.action === "navigate" && payload.route) {
          setTimeout(() => navigate(payload.route), 1500);
          responseText = payload.message || "Navigating you there...";

        } else if (payload.action === "api_call" && payload.api === "sendSOS") {
          sosBranchHandled = true;
          // (structured SOS from n8n — dispatch below)

        } else if (payload.action === "answer" || payload.action === "unknown") {
          responseText = payload.message || "I don't have an answer for that.";
        } else {
          responseText = payload.message || payload.text || payload.response || JSON.stringify(payload);
        }
      } else {
        // responseData is a primitive (string, empty, etc.)
        responseText = String(responseData || "");
      }

      // *** FALLBACK: if n8n returned empty/no action AND user message looks like SOS ***
      if (!sosBranchHandled && isSosRequest(userMsg)) {
        console.log("DEBUG: n8n returned no SOS action, but user message matches SOS intent — triggering SOS directly");
        sosBranchHandled = true;
      }

      // --- SOS DISPATCH (handles both structured n8n action AND fallback keyword detection) ---
      if (sosBranchHandled) {
        const dispatchingMsg = "🚨 Dispatching SOS Alert... please wait.";
        setMessages(prev => [...prev, { role: 'ai', content: dispatchingMsg }]);
        setIsTyping(false);

        try {
          const token = localStorage.getItem('token');

          if (!navigator.geolocation) {
            setMessages(prev => [...prev, {
              role: 'ai',
              content: "❌ Your browser does not support geolocation, which is required for SOS."
            }]);
            toast.error("Geolocation not supported by your browser.", { duration: 6000 });
            return;
          }

          let position;
          try {
            position = await getCurrentPositionAsync();
          } catch (geoErr) {
            console.error("Geolocation Error", geoErr);
            setMessages(prev => [...prev, {
              role: 'ai',
              content: "⚠️ Unable to get your location. Please enable location services and try again."
            }]);
            toast.error("📍 Location access denied. SOS was not sent.", { duration: 6000 });
            return;
          }

          const { latitude, longitude, accuracy } = position.coords;

          await api.post('/api/sos', {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            emergencyType: 'other',
            description: 'Triggered via Emergency AI Assistant'
          });

          sendSOSAlert({ lat: latitude, lng: longitude }, 'other');

          setMessages(prev => [...prev, {
            role: 'ai',
            content: "✅ SOS Alert dispatched successfully! Emergency services have been notified of your location. Stay calm and keep your phone accessible."
          }]);
          toast.success("🚨 Emergency SOS Alert sent successfully!", { duration: 6000 });

        } catch (err) {
          console.error("SOS API Error", err);
          const errMsg = err.response?.data?.message || "Unknown error occurred";
          setMessages(prev => [...prev, {
            role: 'ai',
            content: `❌ Failed to dispatch SOS alert (${errMsg}). Please call emergency services manually or use the SOS button on the map.`
          }]);
          toast.error("SOS failed. Please use the Emergency SOS button on the map.", { duration: 6000, icon: '🆘' });
        }

        return;
      }

      // Safe text parsing for older [NAVIGATE:/path] plain text style just in case
      if (typeof responseText === 'string') {
        const navMatch = responseText.match(/\[NAVIGATE:(\/[a-zA-Z0-9_-]+)\]/i);
        if (navMatch) {
          const targetPage = navMatch[1];
          responseText = responseText.replace(navMatch[0], '').trim() || "Navigating...";
          setTimeout(() => navigate(targetPage), 1500);
        }
      }

      // Ensure responseText is ultimately a string for rendering
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
    <div className="fixed bottom-6 right-20 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-[32rem] bg-[var(--surface-color)] rounded-2xl shadow-2xl mb-4 flex flex-col border border-[var(--border-color)] overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[var(--primary-color)] text-white p-6 flex justify-between items-center shadow-lg relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <Bot className="w-6 h-6 text-[var(--secondary-color)]" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-widest uppercase italic" style={{ fontFamily: 'var(--font-serif)' }}>AI Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-[var(--secondary-color)] rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[var(--background-color)] space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-[1.5rem] px-5 py-4 shadow-sm text-sm leading-relaxed font-medium
                    ${m.role === 'user'
                      ? 'bg-[var(--primary-color)] text-white rounded-tr-sm shadow-xl'
                      : 'bg-white border border-[var(--border-color)] text-[var(--text-color)] rounded-tl-sm'
                    }
                  `}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[var(--surface-color)] border-t border-[var(--border-color)] flex gap-3 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How can I assist you today?"
              className="flex-1 bg-[var(--background-color)] border border-[var(--border-color)] text-[var(--text-color)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="modern-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 group border-4 border-white"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7 text-[var(--secondary-color)] group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--secondary-color)] border-2 border-[var(--primary-color)] rounded-full animate-pulse"></span>
          </div>
        </button>
      )}
    </div>
  );
};

export default N8nChatWidget;
