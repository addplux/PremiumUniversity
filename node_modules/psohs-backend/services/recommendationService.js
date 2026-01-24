const LearningInteraction = require('../models/LearningInteraction');
const User = require('../models/User');
const Course = require('../models/Course');

class RecommendationService {

    /**
     * Get personalized content recommendations for a student
     * Hybrid approach: Content-based (interests) + Collaborative (similar students)
     */
    async getRecommendations(studentId, organizationId, limit = 5) {

        // 1. Get Student Profile & History
        const student = await User.findById(studentId);
        if (!student) return [];

        const interactions = await LearningInteraction.find({
            studentId,
            organizationId
        }).sort({ createdAt: -1 }).limit(50);

        // 2. Content-Based Filtering (Interest Profiling)
        const interests = this.extractInterests(interactions);
        // e.g., { 'programming': 15, 'math': 8, 'history': 2 }

        // 3. Find content matching top interests
        const topTags = Object.entries(interests)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([tag]) => tag);

        // Mock query - in real app would query Material/Content model
        const content Recommendations = [
            { id: '1', title: 'Advanced JavaScript Patterns', type: 'video', tags: ['programming', 'javascript'], relevance: 0.95 },
            { id: '2', title: 'Linear Algebra for ML', type: 'document', tags: ['math', 'algebra'], relevance: 0.88 },
            { id: '3', title: 'African History: Pre-Colonial Era', type: 'video', tags: ['history', 'africa'], relevance: 0.75 }
        ];

        // Filter to return only relevant ones based on tags
        // This is a simplified mock logic
        const filtered = contentRecommendations.filter(c =>
            c.tags.some(t => topTags.includes(t)) || topTags.length === 0
        );

        return filtered.length > 0 ? filtered : contentRecommendations.slice(0, limit);
    }

    /**
     * Extract interest weights from interaction history
     */
    extractInterests(interactions) {
        const interests = {};

        interactions.forEach(interaction => {
            const weight = this.getInteractionWeight(interaction.interactionType);

            interaction.topicTags.forEach(tag => {
                interests[tag] = (interests[tag] || 0) + weight;
            });
        });

        return interests;
    }

    getInteractionWeight(type) {
        switch (type) {
            case 'complete': return 5;
            case 'rate': return 4;
            case 'share': return 3;
            case 'like': return 2;
            case 'view': return 1;
            default: return 1;
        }
    }

    /**
     * Record a new interaction
     */
    async trackInteraction(data) {
        return await LearningInteraction.create(data);
    }
}

module.exports = new RecommendationService();
