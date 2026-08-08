import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, HelpCircle, Calendar, ArrowLeft, Mic, MicOff } from 'lucide-react';

export default function ChatInterface({ candidate, messages, onSendTurn, loading, questionCount, daysCoveredCount, onBackToCandidates }) {
  const [inputMsg, setInputMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isVoiceSupported = Boolean(SpeechRecognition);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!isVoiceSupported) {
      setVoiceError('Voice input is not supported in this browser. Please use text input.');
      return;
    }

    setVoiceError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputMsg((prev) => {
            // Append transcribed text smoothly or set if empty
            return prev ? `${prev} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied. You can continue using text input.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try again or type your answer.');
        } else {
          setVoiceError(`Voice input error (${event.error}). Text input remains available.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setVoiceError('Could not access microphone. Please use text input.');
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSendTurn(inputMsg.trim());
    setInputMsg('');
    setVoiceError(null);
  };

  const member = candidate?.member || {};

  return (
    <div className="glass-card chat-container">
      {/* Top Bar */}
      <div className="chat-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBackToCandidates}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
            title="Back to Candidate Selection"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Interviewing {member.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{member.jobRole} ({member.yearsExperience} yrs exp)</p>
          </div>
        </div>

        <div className="progress-pills">
          <span className="badge badge-primary">
            <HelpCircle size={14} /> Question {questionCount} / 8+
          </span>
          <span className="badge badge-cyan">
            <Calendar size={14} /> {daysCoveredCount} Curriculum Days Covered
          </span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>
            <div className={`avatar ${msg.role}`}>
              {msg.role === 'interviewer' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row interviewer">
            <div className="avatar interviewer">
              <Bot size={20} />
            </div>
            <div className="bubble">
              <div className="typing-indicator">
                <span style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: '#a5b4fc' }}>Interviewer evaluating response</span>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Error / Status Banner */}
      {voiceError && (
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.15)', borderTop: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-input-area" style={{ borderTop: '1px solid var(--border-color)' }}>
        <button
          type="button"
          className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
          onClick={toggleVoiceInput}
          disabled={loading}
          title={isVoiceSupported ? (isListening ? 'Stop Listening' : 'Speak Answer (Optional Voice Input)') : 'Voice input unavailable in this browser'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
            borderColor: isListening ? '#ef4444' : 'var(--border-color)',
            color: '#fff'
          }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          <span style={{ fontSize: '0.85rem', display: 'none', smDisplay: 'inline' }}>
            {isListening ? 'Listening...' : 'Speak Answer'}
          </span>
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder={isListening ? 'Listening... Speak your technical answer...' : 'Type your technical answer here...'}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={loading}
        />

        <button type="submit" className="btn btn-primary" disabled={loading || !inputMsg.trim()}>
          <Send size={16} /> Send Answer
        </button>
      </form>
    </div>
  );
}
