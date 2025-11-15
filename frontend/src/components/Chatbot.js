import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const modelRef = useRef(null);

 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (!modelRef.current) {
      try {
        const genAI = new GoogleGenerativeAI("AIzaSyBvr1us0mxWBq4E3kFGuOLHRSrLFKkS89Y");
        
        modelRef.current = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
      }
    }
  }, []);

 
  const contactOption = "Contact our team";


  const quickQuestions = [
    "How do I book a tutor?",
    "How can I update my availability?",
    "How do I cancel a session?"
  ];

  const keywordMap = [
    {
      keywords: ["book tutor", "book a tutor", "booking tutor", "book session", "book a session", "how to book", "how do i book", "booking process", "request tutor", "request session", "schedule tutor", "schedule session", "find tutor", "hire tutor"],
      answer: "To book a tutor, browse available tutors on your dashboard, select a tutor you're interested in, choose a day and time that works for you, and set the duration of the session. Once you submit the booking request, the tutor will be notified and can accept or reject your request. You'll receive a notification once the tutor responds."
    },
    {
      keywords: ["session rejected", "rejected session", "what happens if rejected", "session declined", "tutor rejected", "booking rejected", "request rejected", "what if tutor says no", "tutor declined", "session not accepted"],
      answer: "If your session is rejected by a tutor, you'll receive a notification about the rejection. The session status will change to 'rejected' in your dashboard. Don't worry - you can try booking with another tutor or request a different time slot with the same tutor. The rejection doesn't affect your account or ability to book other sessions."
    },
    {
      keywords: ["update availability", "change availability", "set availability", "edit availability", "modify availability", "availability settings", "update schedule", "change schedule", "set schedule", "when am i available", "my availability", "tutor availability", "how to set availability"],
      answer: "To update your availability, go to your Tutor Dashboard and find the Availability section. Select a day of the week and enter your available time slots in the format 'HH:MM-HH:MM' (e.g., '09:00-12:00, 14:00-16:00'). You can set different availability for each day of the week. Click 'Save Availability' to update your schedule. Students can only book sessions during your available time slots."
    },
    {
      keywords: ["cancel session", "cancel booking", "how to cancel", "cancel a session", "delete session", "remove session", "unbook session", "cancel my session", "how do i cancel"],
      answer: "To cancel a session, go to your dashboard and find the session you want to cancel. Click the 'Cancel' button next to the session. You can optionally provide a reason for cancellation. Both you and the other party (tutor or client) will be notified of the cancellation. Sessions can be cancelled by either the tutor or the client."
    },
    {
      keywords: ["contact", "email", "talk to team", "talk to real person", "real person", "contact team", "human", "agent", "speak to someone", "real human", "representative", "support team", "help desk", "customer service", "customer support", "reach out", "get in touch"],
      answer: "Would you like to talk to a real person from our team?"
    },
    {
      keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings", "howdy", "hiya", "what's up", "sup", "yo", "hola", "bonjour"],
      answer: "Hi there! I'm your TutorFinder Assistant bot. I can help you with questions about booking tutors, managing sessions, updating availability, and more. Whether you're a client looking to book a tutor or a tutor managing your schedule, I'm here to help! Just type your question below."
    },
    {
      keywords: ["help", "support", "i need help", "assist", "assistance", "what can you do", "what do you do", "how does this work", "how to use", "capabilities", "features", "functions", "purpose", "how can you help"],
      answer: "I'm here to help you with TutorFinder! I can answer questions about booking sessions, managing your schedule, updating availability, canceling sessions, and understanding what happens when sessions are accepted or rejected. If I can't help with something specific, I can connect you with a real team member. Just ask me anything!"
    },
    {
      keywords: ["accept session", "accept booking", "approve session", "session accepted", "tutor accepts", "how to accept", "accept request"],
      answer: "When a client requests a session, you'll receive a notification. Go to your Tutor Dashboard, find the pending session request, and click 'Accept' to approve it. Once accepted, the session status changes to 'accepted' and the client is notified. You can also add an optional message when accepting."
    },
    {
      keywords: ["pending session", "session pending", "waiting for approval", "session request", "pending request", "awaiting response"],
      answer: "A pending session means a booking request has been sent but hasn't been accepted or rejected yet. As a client, you'll see pending sessions in your dashboard while waiting for the tutor's response. As a tutor, you'll see pending requests that need your approval."
    },
    {
      keywords: ["session status", "what is status", "session states", "booking status", "request status"],
      answer: "Sessions can have different statuses: 'pending' (waiting for tutor approval), 'accepted' (tutor approved the session), 'rejected' (tutor declined the session), or 'cancelled' (either party cancelled after acceptance). You can see the status of all your sessions in your dashboard."
    },
    {
      keywords: ["notifications", "alerts", "notify me", "how do i get notified", "session notifications"],
      answer: "You'll receive notifications for important events like new session requests (tutors), session acceptances/rejections (clients), and session cancellations. Notifications appear in your dashboard and are updated in real-time. Make sure to check your notifications regularly to stay updated on your sessions."
    },
    {
      keywords: ["thank you", "thanks", "bye", "see ya", "see you", "thank"],
      answer: "You're welcome! Feel free to ask if you need anything else. Good luck with your tutoring!"
    }
  ];

  // Check for keyword matches - case insensitive
  const checkKeywords = (input) => {
    const lowerInput = input.toLowerCase();
    for (const item of keywordMap) {
      for (const keyword of item.keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          return item.answer;
        }
      }
    }
    return null;
  };

  // Call Gemini API for fallback responses
  const fetchGeminiResponse = async (query) => {
    try {
      if (!modelRef.current) {
        // Re-initialize if not already done
        try {
          const genAIInstance = new GoogleGenerativeAI("AIzaSyBvr1us0mxWBq4E3kFGuOLHRSrLFKkS89Y");
          modelRef.current = genAIInstance.getGenerativeModel({ model: "gemini-2.0-flash" });
        } catch (initError) {
          console.error('Failed to initialize Gemini:', initError);
          return "Sorry, I'm having trouble finding that information. Would you like to talk to a real person from our team?";
        }
      }

      const prompt = `Act as a TutorFinder platform assistant. Answer the following question concisely in 2-3 sentences with helpful information about the TutorFinder tutoring platform. Focus on topics like booking tutors, managing sessions, updating availability, and session statuses. Be accurate and helpful: ${query}`;
      
      const generationConfig = {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      };
      
      const result = await modelRef.current.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      // If Gemini fails, offer to connect with a team member
      return "Sorry, I'm having trouble finding that information. Would you like to talk to a real person from our team?";
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue.trim();
    const userMessage = { text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Check for "talk to real person" specifically
    if (userText.toLowerCase().includes("talk to real person")) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate typing delay
      setMessages(prev => [...prev, { 
        text: "Would you like to talk to a real person from our team?", 
        sender: 'bot',
        showButtons: true 
      }]);
      setIsTyping(false);
      return;
    }
    
    // Check for keyword match first
    const keywordResponse = checkKeywords(userText);
    
    if (keywordResponse) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate typing delay
      if (keywordResponse.includes("Would you like to talk to a real person")) {
        setMessages(prev => [...prev, { 
          text: keywordResponse, 
          sender: 'bot',
          showButtons: true 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: keywordResponse, 
          sender: 'bot',
          isHTML: true // Flag for HTML content
        }]);
      }
    } else {
      // No keyword match, use Gemini API
      try {
        setIsTyping(true);
        const geminiResponse = await fetchGeminiResponse(userText);
        if (geminiResponse.includes("Would you like to talk to a real person")) {
          setMessages(prev => [...prev, { 
            text: geminiResponse, 
            sender: 'bot',
            showButtons: true 
          }]);
        } else {
          setMessages(prev => [...prev, { text: geminiResponse, sender: 'bot' }]);
        }
      } catch (error) {
        console.error("Error with Gemini response:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // If Gemini fails completely, fall back to a generic response
        setMessages(prev => [...prev, { 
          text: "Sorry, I'm having trouble understanding. Would you like to talk to a real person from our team?", 
          sender: 'bot',
          showButtons: true
        }]);
      }
    }
    
    setIsTyping(false);
  };

  // Handle quick replies
  const handleQuickReply = (text) => {
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    
    if (text.toLowerCase() === "talk to real person") {
      setMessages(prev => [...prev, { 
        text: "Would you like to talk to a real person from our team?", 
        sender: 'bot',
        showButtons: true 
      }]);
      return;
    }
    
    if (text.toLowerCase() === 'yes') {
      setShowEmailForm(true);
    } else if (text.toLowerCase() === 'no') {
      setMessages(prev => [...prev, { text: "No problem! Let me know if you need anything else.", sender: 'bot' }]);
    } else {
      // For predefined questions, check keywords
      const keywordResponse = checkKeywords(text);
      if (keywordResponse) {
        if (keywordResponse.includes("Would you like to talk to a real person")) {
          setMessages(prev => [...prev, { 
            text: keywordResponse, 
            sender: 'bot',
            showButtons: true 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            text: keywordResponse, 
            sender: 'bot',
            isHTML: true 
          }]);
        }
      }
    }
  };

  // Handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await fetch("https://formspree.io/f/xqawlpon", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });
      setMessages(prev => [...prev, { text: "Thanks! Your message has been sent to our team. We'll respond soon.", sender: 'bot' }]);
      setShowEmailForm(false);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Failed to send your message. Please try again later.", sender: 'bot' }]);
    }
  };

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = "Hi there! I'm your TutorFinder Assistant bot. I can help you with questions about booking tutors, managing sessions, and more. Ask me anything!";
      setMessages([{ text: greeting, sender: "bot", showContactOption: true }]);
    }
  }, [isOpen]);

  
  const styles = {
    container: {
      position: 'fixed',
      bottom: isMobile ? '16px' : '24px',
      right: isMobile ? '16px' : '24px',
      zIndex: 50
    },
    toggleButton: {
      width: isMobile ? '48px' : '56px',
      height: isMobile ? '48px' : '56px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: 'none',
      outline: 'none'
    },
    toggleButtonHover: {
      backgroundColor: '#1d4ed8'
    },
    chatWindow: {
      position: 'fixed',
      bottom: isMobile ? '72px' : '80px',
      right: isMobile ? '16px' : '24px',
      width: isMobile ? 'calc(100% - 32px)' : '400px',
      height: isMobile ? '60vh' : '500px',
      maxHeight: isMobile ? 'none' : '70vh',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    },
    header: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: isMobile ? '10px 12px' : '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: isMobile ? '14px' : '16px'
    },
    chatBody: {
      flex: 1,
      padding: isMobile ? '12px' : '16px',
      overflowY: 'auto',
      backgroundColor: '#f9fafb',
      maxHeight: 'calc(100% - 120px)'
    },
    suggestionContainer: {
      marginTop: isMobile ? '8px' : '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '8px'
    },
    suggestionTitle: {
      fontSize: isMobile ? '12px' : '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    suggestionBubble: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      borderRadius: '18px',
      padding: isMobile ? '6px 12px' : '8px 16px',
      marginBottom: isMobile ? '6px' : '8px',
      display: 'inline-block',
      wordBreak: 'break-word',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      fontSize: isMobile ? '12px' : '14px'
    },
    suggestionGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '6px' : '8px'
    },
    messageContainer: {
      marginBottom: isMobile ? '8px' : '12px'
    },
    userMessage: {
      display: 'inline-block',
      padding: isMobile ? '8px 12px' : '12px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '12px',
      maxWidth: '85%',
      wordBreak: 'break-word',
      marginLeft: 'auto',
      borderBottomRightRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      fontSize: isMobile ? '14px' : '16px',
      lineHeight: '1.4'
    },
    botMessage: {
      display: 'inline-block',
      padding: isMobile ? '8px 12px' : '12px',
      backgroundColor: 'white',
      color: '#1f2937',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      maxWidth: '85%',
      wordBreak: 'break-word',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      fontSize: isMobile ? '14px' : '16px',
      lineHeight: '1.4'
    },
    inputContainer: {
      borderTop: '1px solid #e5e7eb',
      padding: isMobile ? '8px' : '12px',
      backgroundColor: 'white',
      position: 'sticky',
      bottom: 0
    },
    inputForm: {
      display: 'flex',
      gap: isMobile ? '6px' : '8px'
    },
    textInput: {
      flex: 1,
      padding: isMobile ? '8px 10px' : '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      outline: 'none',
      fontSize: isMobile ? '14px' : '16px',
      minHeight: isMobile ? '40px' : 'auto'
    },
    sendButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: isMobile ? '0 12px' : '0 16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isMobile ? '40px' : 'auto'
    },
    emailForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '8px'
    },
    formInput: {
      padding: isMobile ? '8px 10px' : '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: isMobile ? '14px' : '16px',
      outline: 'none'
    },
    formTextarea: {
      padding: isMobile ? '8px 10px' : '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: isMobile ? '14px' : '16px',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical'
    },
    formButtons: {
      display: 'flex',
      gap: isMobile ? '6px' : '8px'
    },
    formButton: {
      flex: 1,
      padding: isMobile ? '8px' : '10px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px'
    },
    cancelButton: {
      backgroundColor: '#e5e7eb',
      color: '#4b5563'
    },
    submitButton: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    typingIndicator: {
      display: 'inline-block',
      padding: isMobile ? '6px 10px' : '8px 12px',
      backgroundColor: 'white',
      color: '#6b7280',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      fontSize: isMobile ? '12px' : '14px'
    },
    replyButton: {
      backgroundColor: '#2563eb', 
      color: 'white', 
      border: 'none', 
      borderRadius: '6px', 
      padding: isMobile ? '4px 8px' : '4px 12px', 
      fontSize: isMobile ? '12px' : '14px',
      cursor: 'pointer'
    },
    cancelReplyButton: {
      backgroundColor: '#e5e7eb', 
      color: '#4b5563', 
      border: 'none', 
      borderRadius: '6px', 
      padding: isMobile ? '4px 8px' : '4px 12px', 
      fontSize: isMobile ? '12px' : '14px',
      cursor: 'pointer'
    }
  };

  // Safe HTML rendering
  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.toggleButtonHover.backgroundColor}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.toggleButton.backgroundColor}
      >
        {isOpen ? (
          <FaTimes style={{ color: 'white', fontSize: isMobile ? '18px' : '20px' }} />
        ) : (
          <FaComments style={{ color: 'white', fontSize: isMobile ? '18px' : '20px' }} />
        )}
      </button>

      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaComments style={{ fontSize: isMobile ? '16px' : '18px' }} />
              <span style={{ fontWeight: '600' }}>TutorFinder Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <FaTimes style={{ fontSize: isMobile ? '16px' : '18px' }} />
            </button>
          </div>

          <div style={styles.chatBody}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  ...styles.messageContainer, 
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  marginLeft: msg.sender === 'user' ? 'auto' : '0',
                  marginRight: msg.sender === 'user' ? '0' : 'auto'
                }}
              >
                {msg.sender === 'user' ? (
                  <div style={styles.userMessage}>{msg.text}</div>
                ) : (
                  <div style={styles.botMessage}>
                    {msg.isHTML ? (
                      <div dangerouslySetInnerHTML={createMarkup(msg.text)} />
                    ) : (
                      msg.text
                    )}
                  </div>
                )}

                {/* Show contact option and quick questions after greeting */}
                {msg.showContactOption && (
                  <div style={styles.suggestionContainer}>
                    <div style={styles.suggestionTitle}>Suggested questions:</div>
                    <div style={styles.suggestionGrid}>
                      {quickQuestions.map((question, i) => (
                        <div 
                          key={i}
                          style={styles.suggestionBubble}
                          onClick={() => handleQuickReply(question)}
                        >
                          {question}
                        </div>
                      ))}
                      <div 
                        style={styles.suggestionBubble}
                        onClick={() => handleQuickReply("talk to real person")}
                      >
                        {contactOption}
                      </div>
                    </div>
                  </div>
                )}

                {/* Real person buttons */}
                {msg.showButtons && (
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', marginTop: isMobile ? '6px' : '8px', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <button 
                      onClick={() => handleQuickReply("Yes")}
                      style={styles.replyButton}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleQuickReply("No")}
                      style={styles.cancelReplyButton}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ textAlign: 'left', marginBottom: isMobile ? '8px' : '12px' }}>
                <div style={styles.typingIndicator}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            {showEmailForm ? (
              <form onSubmit={handleEmailSubmit} style={styles.emailForm}>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  style={styles.formInput}
                />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Your Email" 
                  required 
                  style={styles.formInput}
                />
                <textarea 
                  name="message" 
                  placeholder="Your Question" 
                  required 
                  style={styles.formTextarea}
                />
                <div style={styles.formButtons}>
                  <button 
                    type="button" 
                    onClick={() => setShowEmailForm(false)}
                    style={{ ...styles.formButton, ...styles.cancelButton }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ ...styles.formButton, ...styles.submitButton }}
                  >
                    Send
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.inputForm}>
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about TutorFinder..."
                  style={styles.textInput}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  style={{ 
                    ...styles.sendButton,
                    opacity: inputValue.trim() ? 1 : 0.7,
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  <FaPaperPlane style={{ fontSize: isMobile ? '14px' : '16px' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        a {
          color: #2563eb;
          text-decoration: underline;
        }
        a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;

