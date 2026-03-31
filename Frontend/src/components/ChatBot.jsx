import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the Janaya360 Assistant. Ask me about political promises or tracking progress!", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Mock AI Response - Replace this with your API call later
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: "I'm currently in 'Demo Mode'. Soon I'll be able to query our database to tell you exactly which promises are kept!", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              width: '350px', height: '500px', background: '#fff', borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
              overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '20px'
            }}
          >
            {/* Chat Header */}
            <div style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)', padding: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}><Bot size={20} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Janaya360 AI</h4>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>Online • Transparency Assistant</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Minimize2 size={18} /></button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#F8FAFC' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: msg.sender === 'user' ? '#EA580C' : '#fff', color: msg.sender === 'user' ? '#fff' : '#1E293B',
                    fontSize: '13px', lineHeight: '1.5', boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(234, 88, 12, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '15px', background: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
              <input
                type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me a question..."
                style={{ flex: 1, border: 'none', background: '#F1F5F9', padding: '10px 15px', borderRadius: '12px', fontSize: '13px', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#EA580C', color: '#fff', border: 'none', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={16} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- THE FLOATING ACTION BUTTON (FAB) --- */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(234, 88, 12, 0.4)',
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
};

export default ChatBot;