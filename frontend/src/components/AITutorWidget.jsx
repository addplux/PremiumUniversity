import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import './AITutorWidget.css';

const AITutorWidget = () => {
    const { user } = useAuth();
    const { name, primaryColor } = useOrganization();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI Tutor. I can help with your course material, assignments, or study tips. What are you working on?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/ai/tutor/chat', {
                message: userMessage.content,
                context: {
                    level: user?.role === 'student' ? 'University Student' : 'User'
                }
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`ai-tutor-widget ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button className="tutor-toggle-btn" onClick={() => setIsOpen(true)}>
                    <span className="tutor-icon">🤖</span>
                    <span className="tutor-label">AI Tutor</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="tutor-window">
                    <div className="tutor-header">
                        <div className="header-info">
                            <span className="tutor-avatar">🤖</span>
                            <div>
                                <h3>{name.split(' ')[0]} Assistant</h3>
                                <span className="status-indicator">Online</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="tutor-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message assistant">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="tutor-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={loading}
                        />
                        <button type="submit" disabled={!input.trim() || loading}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AITutorWidget;
