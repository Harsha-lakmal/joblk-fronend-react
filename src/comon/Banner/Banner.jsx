import React, { useState } from 'react';
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';

// Import the logo image from the assets folder
import logo from '../../Assets/joblk.png'; // Adjust the path as per your project structure

const customResponses = new Set(); // To store custom messages

const Banner = () => {
    const [allMessages, setAllMessages] = useState([]); // State to keep track of all messages

    const steps = [
        {
            id: '1',
            message: "Hello! I'm Joblk Spport Team . How can I help you today?",
            trigger: '2',
        },
        {
            id: '2',
            options: [
                { value: 'courses', label: 'View Courses', trigger: 'courses' },
                { value: 'jobs', label: 'View Jobs', trigger: 'jobs' },
                { value: 'help', label: 'Help me', trigger: 'help' },
                
            ],
        },
        {
            id: 'courses',
            message: "Here are some courses for you!",
            trigger: 'repeat',
        },
        {
            id: 'jobs',
            message: "Check out these interesting jobs!",
            trigger: 'repeat',
        },
        {
            id: 'help',
            message: "I am here to assist you. What do you need help with?",
            trigger: 'repeat',
        },
        {
            id: 'custom-message',
            message: "Please type your custom message below:",
            trigger: 'user-input',
        },
        {
            id: 'user-input',
            user: true,
            trigger: ({ value }) => {
                const lowerValue = value.toLowerCase().trim();
                if (customResponses.has(lowerValue)) {
                    return 'duplicate-message';
                }
                customResponses.add(lowerValue);
                // Add the custom message to the list of all messages
                setAllMessages(prevMessages => [...prevMessages, value]);
                return 'thank-you';
            },
        },
        {
            id: 'thank-you',
            message: "Thank you for your message! We'll get back to you soon.",
            trigger: 'repeat',
        },
        {
            id: 'duplicate-message',
            message: "You've already sent this message. Please send something different.",
            trigger: 'custom-message',
        },
        {
            id: 'view-messages',
            message: `Here are your custom messages: ${allMessages.join(', ')}`,
            trigger: 'repeat',
        },
        {
            id: 'repeat',
            options: [
                { value: 'again', label: 'Show options again', trigger: '2' },
                { value: 'new-message', label: 'Send another message', trigger: 'custom-message' },
                { value: 'end', label: 'End conversation', trigger: 'end' },
            ],
        },
        {
            id: 'end',
            message: "Thank you for chatting with GeekBot! Have a great day!",
            end: true,
        }
    ];

    const theme = {
        background: '#C9FF8F',
        headerBgColor: '#197B22',
        headerFontSize: '20px',
        botBubbleColor: '#0F3789',
        headerFontColor: 'white',
        botFontColor: 'white',
        userBubbleColor: '#FF5733',
        userFontColor: 'white',
    };

    const config = {
        botAvatar: logo, // Use the imported logo image for the bot avatar
        floating: true,
    };

    return (
        <div className="App">
            <ThemeProvider theme={theme}>
                <ChatBot
                    headerTitle="Joblk sport Team "
                    steps={steps}
                    {...config}
                />
            </ThemeProvider>
        </div>
    );
};

export default Banner ; 