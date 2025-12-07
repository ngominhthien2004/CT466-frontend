import { defineStore } from 'pinia';
import ChatbotService from '@/services/chatbot.service';

export const useChatbotStore = defineStore('chatbot', {
    state: () => ({
        isOpen: false,
        isMinimized: false,
        messages: [],
        isLoading: false,
        error: null,
        hasNewMessage: false
    }),

    getters: {
        allMessages: (state) => state.messages,
        lastMessage: (state) => state.messages[state.messages.length - 1] || null,
        messageCount: (state) => state.messages.length
    },

    actions: {
        toggleChat() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.hasNewMessage = false;
            }
        },

        openChat() {
            this.isOpen = true;
            this.isMinimized = false;
            this.hasNewMessage = false;
        },

        closeChat() {
            this.isOpen = false;
        },

        toggleMinimize() {
            this.isMinimized = !this.isMinimized;
        },

        addMessage(role, content) {
            this.messages.push({
                id: Date.now() + Math.random(),
                role,
                content,
                timestamp: new Date()
            });
        },

        async sendMessage(content) {
            if (!content || !content.trim()) {
                return;
            }

            // Add user message
            this.addMessage('user', content.trim());
            this.isLoading = true;
            this.error = null;

            try {
                // Prepare messages for API (only role and content)
                const apiMessages = this.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

                // Call chatbot service
                const response = await ChatbotService.chat(apiMessages);

                // Add AI response
                if (response.data && response.data.message) {
                    this.addMessage('assistant', response.data.message);
                    
                    // Show notification badge if chat is closed
                    if (!this.isOpen) {
                        this.hasNewMessage = true;
                    }
                } else {
                    throw new Error('Invalid response from server');
                }

            } catch (error) {
                console.error('Send message error:', error);
                this.error = error.response?.data?.message || 'Không thể kết nối với AI. Vui lòng thử lại.';
                
                // Add error message
                this.addMessage('assistant', '⚠️ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
            } finally {
                this.isLoading = false;
            }
        },

        clearMessages() {
            this.messages = [];
            this.error = null;
        },

        initWelcomeMessage() {
            if (this.messages.length === 0) {
                this.addMessage(
                    'assistant',
                    'Xin chào! 👋 Tôi là trợ lý AI của NovelMT. Tôi có thể giúp bạn:\n\n' +
                    '• Tìm kiếm và gợi ý tiểu thuyết\n' +
                    '• Giải đáp thắc mắc về nền tảng\n' +
                    '• Hỗ trợ các tính năng\n\n' +
                    'Bạn cần giúp gì không?'
                );
            }
        }
    }
});
