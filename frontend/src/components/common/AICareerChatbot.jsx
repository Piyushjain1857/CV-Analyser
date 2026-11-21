import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from './Button';
import Badge from './Badge';
import './AICareerChatbot.css';

const SUGGESTED_PROMPTS = [
  'How can I improve my ATS score?',
  'Which skills am I missing?',
  'Am I suitable for a Python Developer role?',
  'How can I improve my projects section?',
  'What should I learn next?',
  'What technical interview questions should I expect?',
];

function formatInline(text) {
  if (!text) return '';
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index}>{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function FormattedMessageContent({ content }) {
  if (!content) return null;

  const rawLines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    flushList();
    blocks.push({ type: 'p', text: line });
  }
  flushList();

  return (
    <div className="formatted-msg-blocks">
      {blocks.map((block, idx) => {
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="msg-bullet-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="msg-bullet-item">
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="msg-ordered-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="msg-ordered-item">
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="msg-para">
            {formatInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export function AICareerChatbot({ resumeId, inline = false, initialOpen = false }) {
  const { user } = useAuth();
  const { activeAnalysis, addToast } = useApp();

  const [isOpen, setIsOpen] = useState(initialOpen || inline);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const effectiveResumeId =
    resumeId || activeAnalysis?.resume?.id || activeAnalysis?.resumeId || 'all';

  // Load chat history on mount or resumeId change
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, effectiveResumeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await api.getChatHistory(effectiveResumeId);
      if (res.success && res.data) {
        if (res.data.length === 0) {
          // Add default welcome message
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: `Hello ${user?.name || 'there'}! I am your **CV Insight AI Career Assistant**. I have analyzed your resume targeting **${activeAnalysis?.resume?.targetRole || user?.role || 'Software Engineering'}**.\n\nAsk me anything about improving your ATS score, rewriting bullet points, closing skill gaps, or preparing for interviews!`,
              createdAt: new Date().toISOString(),
              source: 'CV Insight Career Assistant',
            },
          ]);
        } else {
          setMessages(res.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch chat history:', err.message);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');

    // Optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage({
        resumeId: effectiveResumeId !== 'all' ? effectiveResumeId : undefined,
        message: text,
      });

      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          res.data.userMessage,
          res.data.assistantMessage,
        ]);
      }
    } catch (err) {
      addToast('Chat response failed', 'error', err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue processing your request: "${err.message}". Please try again shortly.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all conversation history with the Career Assistant?')) return;
    try {
      await api.clearChatHistory(effectiveResumeId);
      setMessages([
        {
          id: 'welcome-cleared',
          role: 'assistant',
          content: 'Conversation history cleared. How can I help you elevate your resume today?',
          createdAt: new Date().toISOString(),
        },
      ]);
      addToast('Chat history cleared', 'info');
    } catch (err) {
      addToast('Failed to clear chat', 'error', err.message);
    }
  };

  // Inline render (e.g. inside a dashboard tab)
  if (inline) {
    return (
      <div className="career-chatbot-inline">
        <div className="chatbot-header inline-header">
          <div className="chatbot-header-title">
            <div className="chatbot-header-icon-box">
              <Bot size={20} className="chatbot-bot-icon" />
            </div>
            <div>
              <h3 className="chatbot-name">AI Career Assistant</h3>
              <div className="chatbot-context-sub">
                <span>Grounded in: </span>
                <strong className="chatbot-grounding-target">
                  {activeAnalysis?.resume?.title || activeAnalysis?.resume?.targetRole || 'Your Active Resume'}
                </strong>
              </div>
            </div>
          </div>

          <div className="chatbot-header-actions">
            <button
              type="button"
              className="chat-icon-btn"
              onClick={handleClearChat}
              title="Clear conversation history"
              aria-label="Clear chat history"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className="chat-icon-btn"
              onClick={loadHistory}
              title="Refresh conversation"
              aria-label="Refresh conversation"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="chat-prompt-chips">
          <div className="prompt-chips-label">
            <Lightbulb size={14} className="text-amber" />
            <span>Suggested Inquiries:</span>
          </div>
          <div className="chips-list">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                className="prompt-chip"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="chatbot-messages-feed inline-feed">
          {fetchingHistory ? (
            <div className="chat-loading-state">
              <span className="btn-spinner" />
              <span>Loading conversation history from PostgreSQL...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className={`chat-avatar ${msg.role}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`chat-bubble ${msg.role}`}>
                  <div className="chat-bubble-header">
                    <span className="chat-author">
                      {msg.role === 'user' ? 'You' : 'CV Insight Career AI'}
                    </span>
                    {msg.source && <span className="chat-source-tag">{msg.source}</span>}
                  </div>
                  <div className="chat-bubble-text markdown-render">
                    <FormattedMessageContent content={msg.content} />
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar assistant">
                <Bot size={14} />
              </div>
              <div className="chat-bubble assistant typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-text">Analyzing your resume context...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chatbot-input-bar inline-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="chat-text-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your ATS score, skills gap, bullet rewrites, or interview questions..."
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Send}
            disabled={!inputMessage.trim() || loading}
            className="chat-send-submit-btn"
          >
            Send
          </Button>
        </form>
      </div>
    );
  }

  // Floating Widget Render
  return (
    <div className={`career-chatbot-floating ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-trigger"
          onClick={() => setIsOpen(true)}
          title="Open AI Career Assistant Chatbot"
          aria-label="Open AI Career Assistant"
        >
          <Bot size={22} />
          <span className="trigger-pulse" />
          <span className="trigger-label">Career AI</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-floating-window animate-scale-up">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <div className="chatbot-header-icon-box small">
                <Bot size={16} className="chatbot-bot-icon" />
              </div>
              <div>
                <h3 className="chatbot-name">AI Career Assistant</h3>
                <span className="chatbot-context-sub">
                  Target: {activeAnalysis?.resume?.targetRole || 'Software Professional'}
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chat-icon-btn"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="chat-prompt-chips mini">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                type="button"
                className="prompt-chip mini"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="chatbot-messages-feed floating-feed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className={`chat-bubble ${msg.role}`}>
                  <div className="chat-bubble-text">
                    <FormattedMessageContent content={msg.content} />
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row assistant">
                <div className="chat-bubble assistant typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            className="chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="chat-text-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Career AI..."
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputMessage.trim() || loading}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AICareerChatbot;
