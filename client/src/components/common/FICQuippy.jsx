import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMaximize2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './FICQuippy.css';

const FICQuippy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          { text: "Hi, I am FIC Quippy, how can I help you?", sender: 'bot' }
        ]);
      }, 300);
    }
  }, [isOpen]);

  // Auto-scroll inside chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInputValue('');

    // Process bot response
    setTimeout(() => {
      generateResponse(userMsg.toLowerCase());
    }, 600);
  };

  const generateResponse = (msg) => {
    let botResponse = "I'm still learning! You can ask me to help you upload a document, view categories, or check the dashboard.";
    
    if (msg.includes('upload') || msg.includes('add') || msg.includes('new document') || msg.includes('put file')) {
      botResponse = "I can help with that. You can upload documents from the Documents Library. Let me take you there!";
      setTimeout(() => navigate('/documents'), 2000);
    } else if (msg.includes('category') || msg.includes('folder') || msg.includes('organize') || msg.includes('mou') || msg.includes('hr')) {
      botResponse = "You can browse all organized corporate folders in the Categories section. Opening it now.";
      setTimeout(() => navigate('/categories'), 2000);
    } else if (msg.includes('dashboard') || msg.includes('home') || msg.includes('stats') || msg.includes('overview')) {
      botResponse = "Let's head back to the main Nexus Control Center dashboard.";
      setTimeout(() => navigate('/'), 1500);
    } else if (msg.includes('delete') || msg.includes('trash') || msg.includes('recycle') || msg.includes('remove')) {
      botResponse = "Deleted files are securely stored in the Recycle Bin. I'll open it for you.";
      setTimeout(() => navigate('/trash'), 2000);
    } else if (msg.includes('archive') || msg.includes('old')) {
      botResponse = "Accessing the long-term Archive Vault.";
      setTimeout(() => navigate('/archive'), 1500);
    } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      botResponse = "Hello! I'm here to assist you with the Forge India Connect platform. What do you need?";
    } else if (msg.includes('who are you') || msg.includes('what are you')) {
      botResponse = "I am FIC Quippy, your AI assistant designed specifically to help you navigate and use the Document Management Portal effectively.";
    }

    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
  };

  return (
    <div className="fic-quippy-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="fic-quippy-window animate-slideUp">
          <div className="quippy-header">
            <div className="d-flex align-items-center gap-2">
              <div className="quippy-avatar">Q</div>
              <div>
                <h3 className="quippy-title">FIC Quippy</h3>
                <span className="quippy-status">Online • Real-time Support</span>
              </div>
            </div>
            <button className="quippy-close-btn" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="quippy-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`quippy-message-wrapper ${msg.sender}`}>
                {msg.sender === 'bot' && <div className="quippy-msg-avatar">Q</div>}
                <div className={`quippy-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="quippy-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask FIC Quippy..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={!inputValue.trim()}>
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          className="fic-quippy-fab animate-bounceIn" 
          onClick={() => setIsOpen(true)}
          title="Chat with FIC Quippy"
        >
          <FiMessageSquare />
        </button>
      )}
    </div>
  );
};

export default FICQuippy;
