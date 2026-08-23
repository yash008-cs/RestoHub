import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { chatService } from '../../services/chatService';

// Helper to render bold **text** and newlines cleanly in message bubbles
const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lIdx) => {
    // Process bold syntax **bold text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <React.Fragment key={lIdx}>
        {renderedLine}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! 👋 I'm your RestoHub AI Assistant. I can recommend dishes, explore cuisines, suggest budget meals, find top-rated restaurants, and help with your food orders. What would you like to eat today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const suggestionChips = [
    { label: '🚩 Maharashtrian food', query: 'Suggest me Maharashtrian food' },
    { label: '🍗 Non-veg options', query: 'Suggest non-veg options' },
    { label: '🥘 Which biryani is best?', query: 'Which biryani is best?' },
    { label: '🌶️ Spicy starters', query: 'Suggest spicy starters' },
    { label: '💰 Meals under ₹300', query: 'Suggest food under ₹300' },
    { label: '🥗 Healthy diet', query: 'Suggest healthy food options' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (isTyping) return;
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const data = await chatService.sendMessage(text);
      const botResponseText = data?.response || data?.message || "I'm here to help!";
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chatbot API connection notice:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="chatbot-global-container">
      {/* Floating Chat Trigger Button */}
      <button
        className={`chatbot-floating-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close RestoHub AI Assistant' : 'Open RestoHub AI Assistant'}
        title="RestoHub AI Assistant"
      >
        {isOpen ? (
          <X size={24} color="#ffffff" />
        ) : (
          <>
            <div className="chatbot-trigger-icon">
              <Bot size={26} color="#ffffff" />
            </div>
            <span className="chatbot-pulse-dot" />
          </>
        )}
      </button>

      {/* Floating Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-window-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-container">
                <div className="chatbot-bot-badge-icon">
                  <Bot size={20} color="#ffffff" />
                </div>
                <span className="chatbot-online-dot" />
              </div>
              <div>
                <h3 className="chatbot-title">
                  <span>RestoHub AI Assistant</span>
                  <Sparkles size={14} className="sparkle-icon" color="#FC8019" />
                </h3>
                <span className="chatbot-status-subtitle">Online • Real-time DB Assistant</span>
              </div>
            </div>

            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'user-side' : 'bot-side'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="msg-bot-avatar-icon">
                    <Bot size={16} color="#ffffff" />
                  </div>
                )}
                <div className="chat-bubble-content">
                  <div className="msg-text">{renderFormattedText(msg.text)}</div>
                  <span className="msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Quick Suggestion Chips */}
            {messages.length <= 2 && (
              <div className="chatbot-suggestions-wrapper">
                <p className="suggestions-prompt">Popular queries:</p>
                <div className="suggestions-grid">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      className="suggestion-chip-btn"
                      onClick={() => handleSendMessage(chip.query)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble-wrapper bot-side">
                <div className="msg-bot-avatar-icon">
                  <Bot size={16} color="#ffffff" />
                </div>
                <div className="chat-bubble-content typing-bubble">
                  <div className="typing-indicator-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="chatbot-footer">
            <div className="chatbot-input-row">
              <input
                type="text"
                className="chatbot-input-field"
                placeholder="Ask for food recommendations..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={`chatbot-send-btn ${!inputMessage.trim() ? 'disabled' : ''}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="chatbot-footer-caption">Powered by RestoHub AI Engine</p>
          </div>
        </div>
      )}
    </div>
  );
};
