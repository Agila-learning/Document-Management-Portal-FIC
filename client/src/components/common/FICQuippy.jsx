import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './FICQuippy.css';

// ─── Intent Engine ────────────────────────────────────────────────────────────
const intents = [
  {
    keywords: ['upload', 'add file', 'new document', 'put file', 'add document', 'attach'],
    reply: "Sure! You can upload files from the Documents Library. Taking you there now! 📂",
    route: '/documents', delay: 1800
  },
  {
    keywords: ['document', 'library', 'view document', 'see document', 'all document', 'file list', 'show file'],
    reply: "Opening the Document Library for you! 📋",
    route: '/documents', delay: 1500
  },
  {
    keywords: ['categor', 'folder', 'mou', 'noc', 'sla', 'hr document', 'legal', 'offer letter', 'poster', 'client document', 'candidate document', 'miscellaneous', 'organize'],
    reply: "I'll take you to the Categories section where all folders are organized by type. 🗂️",
    route: '/categories', delay: 1600
  },
  {
    keywords: ['dashboard', 'home', 'overview', 'stats', 'control center', 'main page'],
    reply: "Navigating to the Nexus Control Center dashboard! 🏠",
    route: '/', delay: 1400
  },
  {
    keywords: ['trash', 'recycle', 'deleted', 'bin', 'recover', 'restore'],
    reply: "Taking you to the Recycle Bin — deleted files live there temporarily. 🗑️",
    route: '/trash', delay: 1700
  },
  {
    keywords: ['archive', 'old file', 'archived'],
    reply: "Opening the Archive Vault for long-term storage. 📦",
    route: '/archive', delay: 1500
  },
  {
    keywords: ['candidate', 'personnel', 'verify', 'unverified', 'staff record'],
    reply: "Navigating to the Candidate Directory to manage personnel records. 👤",
    route: '/candidates', delay: 1600
  },
  {
    keywords: ['alert', 'expir', 'warning', 'deadline', 'notify'],
    reply: "Checking the Alerts section for documents nearing expiry! ⚠️",
    route: '/alerts', delay: 1500
  },
  {
    keywords: ['setting', 'profile', 'account', 'password', 'preference'],
    reply: "Opening Account Settings for you. ⚙️",
    route: '/settings', delay: 1500
  },
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'howdy'],
    reply: "Hello! 👋 I'm FIC Quippy. I can help you navigate to Documents, Categories, Candidates, Alerts, Archive, or Trash. What do you need?",
    route: null
  },
  {
    keywords: ['who are you', 'what are you', 'introduce', 'your name'],
    reply: "I'm FIC Quippy 🤖 — your AI assistant for the Forge India Connect Document Portal. I can answer questions, open pages, and guide you through the system!",
    route: null
  },
  {
    keywords: ['help', 'what can you do', 'guide', 'support', 'assist'],
    reply: "I can help you:\n• 📂 Upload or view Documents\n• 🗂️ Browse Categories\n• 👤 Manage Candidates\n• ⚠️ View Alerts\n• 📦 Access Archive\n• 🗑️ Recover deleted files\nJust ask!",
    route: null
  },
  {
    keywords: ['thank', 'thanks', 'great', 'awesome', 'perfect', 'good'],
    reply: "You're welcome! 😊 Let me know if there's anything else I can help with.",
    route: null
  }
];

const findIntent = (msg) => {
  const lower = msg.toLowerCase();
  return intents.find(intent => intent.keywords.some(kw => lower.includes(kw)));
};

// ─── Component ────────────────────────────────────────────────────────────────
const FICQuippy = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [inputValue, setInputVal] = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // ── Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          text: "Hi, I am FIC Quippy! 👋 How can I help you today? Ask me to navigate to any section, or type 'help' to see what I can do.",
          sender: 'bot'
        }]);
        setIsTyping(false);
        setHasGreeted(true);
      }, 800);
    }
  }, [isOpen, hasGreeted]);

  // ── Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInputVal('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const intent = findIntent(userMsg);
      if (intent) {
        setMessages(prev => [...prev, { text: intent.reply, sender: 'bot' }]);
        if (intent.route) {
          setTimeout(() => navigate(intent.route), intent.delay || 1500);
        }
      } else {
        setMessages(prev => [...prev, {
          text: "I'm not quite sure about that. You can ask me to open Documents, Categories, Candidates, Alerts, Archive, Trash, or Dashboard. Type 'help' for a full list! 🤖",
          sender: 'bot'
        }]);
      }
    }, 900 + Math.random() * 400); // realistic delay
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const quickReplies = ['Upload Document', 'View Categories', 'Candidates', 'Help'];

  return (
    <div className="fic-quippy-container">
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="fic-quippy-window animate-slideUp">
          {/* Header */}
          <div className="quippy-header">
            <div className="d-flex align-items-center gap-2">
              <div className="quippy-avatar">Q</div>
              <div>
                <div className="quippy-title">FIC Quippy</div>
                <div className="quippy-status">Online • Real-time Support</div>
              </div>
            </div>
            <button className="quippy-close-btn" onClick={() => setIsOpen(false)} title="Close">
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="quippy-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`quippy-message-wrapper ${msg.sender}`}>
                {msg.sender === 'bot' && <div className="quippy-msg-avatar">Q</div>}
                <div className={`quippy-bubble ${msg.sender}`} style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="quippy-message-wrapper bot">
                <div className="quippy-msg-avatar">Q</div>
                <div className="quippy-bubble bot">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies — only show after greeting */}
            {hasGreeted && messages.length === 1 && !isTyping && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      background: '#eff6ff', border: '1.5px solid #bfdbfe',
                      color: '#2563eb', borderRadius: '20px', padding: '5px 12px',
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={e => e.target.style.background = '#dbeafe'}
                    onMouseOut={e  => e.target.style.background = '#eff6ff'}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="quippy-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type a message…"
              value={inputValue}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={!inputValue.trim() || isTyping} title="Send">
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {/* ── FAB Button ── */}
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
