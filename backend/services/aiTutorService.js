const { CircuitBreaker } = require('../util/resilience');
const notificationService = require('./notificationService');

let GoogleGenerativeAI;
try {
    const generativeAi = require('@google/generative-ai');
    GoogleGenerativeAI = generativeAi.GoogleGenerativeAI;
} catch (e) {
    console.warn('⚠️ @google/generative-ai dependency not found. AI Tutor will run in mock mode.');
}

class AITutorService {
    constructor() {
        this.genAI = process.env.GEMINI_API_KEY && GoogleGenerativeAI
            ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            : null;
        this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

        // Initialize Circuit Breaker for Gemini API
        if (this.model) {
            this.breaker = new CircuitBreaker(
                (prompt) => this.model.generateContent(prompt),
                { failureThreshold: 3, resetTimeout: 60000 } // 1 minute reset
            );
        }
    }

    async getResponse(studentId, message, context = {}) {
        // If no API key or dependency, or circuit breaker tripped, return mock/fallback
        if (!this.model) {
            return this.getMockResponse(message);
        }

        try {
            const systemPrompt = `
                You are an AI Tutor for AfriEdu Hub.
                Student Context:
                - Name: ${context.studentName || 'Student'}
                - Course: ${context.courseName || 'General'}
                - Level: ${context.level || 'University'}
                
                Instructions:
                - Be encouraging, patient, and clear.
                - Use culturally relevant examples for Africa where appropriate.
                - Explain concepts simply but correctly.
                - Do not write essays for the student, guide them.
                - If asked about fees/admin, refer them to the administration.
            `;

            const prompt = `${systemPrompt}\n\nStudent message: ${message}`;

            // Use Circuit Breaker to fire the request
            const result = await this.breaker.fire(prompt);
            const response = await result.response;
            const text = response.text();

            // Send real-time notification
            notificationService.sendToUser(studentId, {
                title: 'AI Tutor Response',
                message: `Your tutor has replied to: "${message.substring(0, 20)}..."`,
                type: 'info',
                context: 'ai_chat'
            });

            return text;

        } catch (error) {
            console.error('AI Tutor Error:', error.message);
            if (error.message.includes('Circuit Breaker is OPEN')) {
                return "The AI service is currently unavailable. I'm switching to offline mode.";
            }
            return "I'm having trouble connecting right now. Please try again later or ask your instructor directly.";
        }
    }

    getMockResponse(message) {
        const msg = message.toLowerCase();
        return new Promise(resolve => {
            setTimeout(() => {
                if (msg.includes('hello') || msg.includes('hi')) {
                    resolve("Hello! I'm your AI Tutor (running in fallback mode). How can I help you today?");
                } else if (msg.includes('math') || msg.includes('algebra')) {
                    resolve("Mathematics can be challenging! Share the specific problem, and I'll guide you through it.");
                } else if (msg.includes('fee') || msg.includes('payment')) {
                    resolve("For questions about fees, please check the 'Financial Statements' section or contact the finance office.");
                } else {
                    resolve("I'm currently in fallback mode, but I'll do my best to help! Could you specify your concern?");
                }
            }, 800);
        });
    }
}

module.exports = new AITutorService();
