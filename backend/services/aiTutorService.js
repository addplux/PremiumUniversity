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
    }

    async getResponse(studentId, message, context = {}) {
        // If no API key or dependency, return mock response for demo/testing
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
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('AI Tutor Error:', error);
            return "I'm having trouble connecting right now. Please try again later or ask your instructor directly.";
        }
    }

    getMockResponse(message) {
        // Simple keyword matching for demo purposes
        const msg = message.toLowerCase();

        // Simulate thinking delay
        return new Promise(resolve => {
            setTimeout(() => {
                if (msg.includes('hello') || msg.includes('hi')) {
                    resolve("Hello! I'm your Gemini-powered AI Tutor (running in mock mode). How can I help you today?");
                } else if (msg.includes('math') || msg.includes('algebra') || msg.includes('calculus')) {
                    resolve("Mathematics can be challenging! Could you share the specific problem you're working on? I can help guide you through the steps.");
                } else if (msg.includes('assignment') || msg.includes('homework')) {
                    resolve("I can help clarify assignment requirements or review concepts, but I can't do the work for you. What specifically are you stuck on?");
                } else if (msg.includes('fee') || msg.includes('payment')) {
                    resolve("For questions about fees or payments, please check the 'Financial Statements' section in your dashboard or contact the finance office.");
                } else if (msg.includes('thank')) {
                    resolve("You're welcome! Keep up the good work. Let me know if you need anything else.");
                } else {
                    resolve("That's an interesting question. To give you the best answer, could you provide a bit more context or specific details about what you're learning?");
                }
            }, 1000);
        });
    }
}

module.exports = new AITutorService();

