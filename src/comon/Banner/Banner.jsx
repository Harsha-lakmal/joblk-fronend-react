import React, { useState, useEffect, useRef } from 'react';

const Banner = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const messagesEndRef = useRef(null);

  const botResponses = [
    {
      keywords: ['hello', 'hi', 'hey'],
      responses: ["Hello there!", "Hi! How can I help you?", "Hey! What's up?"],
    },
    {
      keywords: ['how are you', "how's it going"],
      responses: ["I'm doing well, thank you!", "I'm just a bot, but I'm functioning perfectly!", "All systems operational!"],
    },
    {
      keywords: ['thanks', 'thank you'],
      responses: ["You're welcome!", "Happy to help!", "No problem at all!"],
    },
    {
      keywords: ['bye', 'goodbye'],
      responses: ["Goodbye! Come back anytime!", "See you later!", "Bye! Have a great day!"],
    },
    {
      keywords: ['default'],
      responses: [
        "I'm not sure I understand. Can you rephrase that?",
        "Interesting! Tell me more.",
        "I'm still learning. Could you ask me something else?",
      ],
    },
  ];

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(getRandomResponse(['Hi there!', 'Hello! How can I help?', 'Welcome!']));
      }, 500);
    }
  }, [isChatOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isUser: false }]);
  };

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const findBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    for (const responseSet of botResponses) {
      if (responseSet.keywords.some(keyword => 
        responseSet.keywords[0] === 'default' ? false : lowerCaseMessage.includes(keyword))
      ) {
        return getRandomResponse(responseSet.responses);
      }
    }
    
    const defaultSet = botResponses.find(set => set.keywords[0] === 'default');
    return getRandomResponse(defaultSet.responses);
  };

  const handleSend = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = { id: Date.now(), text: inputMessage, isUser: true };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setShowCancel(true);
    
    setTimeout(() => {
      const botResponse = findBotResponse(inputMessage);
      addBotMessage(botResponse);
    }, 800);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setShowCancel(false);
    }
  };

  const handleCancel = () => {
    setMessages([]);
    setShowCancel(false);
    setTimeout(() => {
      addBotMessage(getRandomResponse(["What would you like to talk about?", "How can I help you today?", "What's on your mind?"]));
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
    }}>
      {!isChatOpen && (
        <button 
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '35px',
            backgroundColor: '#3498db',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
            border: 'none',
            cursor: 'pointer',
          }} 
          onClick={toggleChat}
        >
          <img 
            src="/api/placeholder/40/40" 
            alt="Chat bot icon"
            style={{
              width: '40px',
              height: '40px',
              filter: 'brightness(0) invert(1)',
            }} 
          />
        </button>
      )}

      {isChatOpen && (
        <div style={{
          width: '320px',
          height: '480px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            backgroundColor: '#3498db',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
          }}>
            <span style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold',
            }}>ChatBot</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
            }}>
              {showCancel && (
                <button 
                  onClick={handleCancel} 
                  style={{
                    marginRight: '15px',
                    backgroundColor: '#e74c3c',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}>Clear</span>
                </button>
              )}
              <button 
                onClick={toggleChat} 
                style={{
                  backgroundColor: '#2c3e50',
                  width: '36px',
                  height: '36px',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}>✕</span>
              </button>
            </div>
          </div>

          <div style={{
            padding: '15px',
            flexGrow: 1,
            paddingBottom: '5px',
            overflowY: 'auto',
          }}>
            {messages.map((item) => (
              <div 
                key={item.id.toString()}
                style={{
                  maxWidth: '80%',
                  padding: '12px',
                  borderRadius: '15px',
                  marginBottom: '12px',
                  backgroundColor: item.isUser ? '#3498db' : '#f0f0f0',
                  alignSelf: item.isUser ? 'flex-end' : 'flex-start',
                  borderBottomRightRadius: item.isUser ? '5px' : '15px',
                  borderBottomLeftRadius: item.isUser ? '15px' : '5px',
                  float: item.isUser ? 'right' : 'left',
                  clear: 'both',
                }}
              >
                <span style={{
                  color: item.isUser ? '#fff' : '#333',
                  fontSize: '16px',
                }}>
                  {item.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            display: 'flex',
            padding: '12px',
            backgroundColor: '#fff',
            borderTop: '1px solid #eee',
            alignItems: 'center',
          }}>
            <input
              type="text"
              style={{
                flex: 1,
                border: '1px solid #ddd',
                borderRadius: '25px',
                padding: '10px 15px',
                color: '#333',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
                outline: 'none',
              }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={handleKeyPress}
            />
            <button 
              style={{
                marginLeft: '12px',
                backgroundColor: '#3498db',
                width: '45px',
                height: '45px',
                borderRadius: '23px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                border: 'none',
                cursor: 'pointer',
              }} 
              onClick={handleSend}
            >
              <span style={{
                fontSize: '22px',
                color: '#fff',
                fontWeight: 'bold',
              }}>➤</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;