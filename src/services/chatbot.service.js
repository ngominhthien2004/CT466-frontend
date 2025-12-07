import createApiClient from './api.service';

class ChatbotService {
    constructor() {
        this.api = createApiClient('/api/chatbot');
    }

    /**
     * Send message to AI chatbot
     * @param {Array} messages - Array of {role: 'user'|'assistant', content: string}
     * @returns {Promise} Response with AI message
     */
    async chat(messages) {
        try {
            const response = await this.api.post('/chat', { messages });
            return response.data;
        } catch (error) {
            console.error('Chatbot service error:', error);
            throw error;
        }
    }

    /**
     * Get chat history (future feature)
     * @returns {Promise} Chat history
     */
    async getHistory() {
        try {
            const response = await this.api.get('/history');
            return response.data;
        } catch (error) {
            console.error('Get history error:', error);
            throw error;
        }
    }
}

export default new ChatbotService();
