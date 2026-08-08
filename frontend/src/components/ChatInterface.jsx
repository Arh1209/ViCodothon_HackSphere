import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, HelpCircle, Calendar, ArrowLeft, Mic, MicOff } from 'lucide-react';

export default function ChatInterface({ candidate, messages, onSendTurn, loading, questionCount, daysCoveredCount, onBackToCandidates }) {
  const [inputMsg, setInputMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const isVoiceSupported = Boolean(SpeechRecognition);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleVoiceInput = async () => {
    if (!isVoiceSupported) {
      setVoiceError('Web Speech API is not supported in this browser. Please type your answer using the text box.');
      return;
    }

    // Stop listening if currently active
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    baseTextRef.current = inputMsg;

    // Request browser microphone permission if mediaDevices is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permErr) {
        console.warn('Microphone permission request failed:', permErr);
        setVoiceError('Microphone permission denied. Please grant microphone access in browser settings or use text input.');
        return;
      }
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
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const combinedSpeech = (finalTranscript + interimTranscript).trim();
        const base = baseTextRef.current.trim();

        if (combinedSpeech) {
          setInputMsg(base ? `${base} ${combinedSpeech}` : combinedSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone permission denied. You can continue typing your answer.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Speak into microphone or type your answer.');
        } else if (event.error === 'aborted') {
          // Normal manual stop
        } else {
          setVoiceError(`Voice recognition error (${event.error}). Text input remains available.`);
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
      setVoiceError('Could not start microphone speech recognition. Please use text input.');
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition on submit:', e);
      }
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1rem',
            background: isListening ? '#dc2626' : 'rgba(255, 255, 255, 0.08)',
            borderColor: isListening ? '#ef4444' : 'var(--border-color)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {isListening ? <MicOff size={16} color="#ffffff" /> : <Mic size={16} color={isVoiceSupported ? '#a5b4fc' : '#64748b'} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {isListening ? 'Listening...' : 'Speak Answer'}
          </span>
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder={isListening ? '🎤 Listening... Speak your technical answer...' : 'Type your technical answer here...'}
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
