import React, { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/assets/modules/channel-web/inject.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Or you can render a loading spinner here until the chat loads

};

export default Chatbot;
