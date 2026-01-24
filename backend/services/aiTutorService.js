const OpenAI = require('openai');

class AITutorService {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        }) : null;
    }

    async getResponse(studentId, message, context = {}) {
        // If no API key, return mock response for demo/testing
        if (!this.openai) {
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

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4', // or gpt-3.5-turbo for cost
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content;

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
                    resolve("Hello! I'm your AI Tutor. How can I help you with your studies today?");
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
