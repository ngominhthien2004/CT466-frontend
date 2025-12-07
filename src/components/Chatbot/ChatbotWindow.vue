<template>
  <Transition name="chat-window">
    <div v-if="chatbot.isOpen" class="chatbot-window" :class="{ minimized: chatbot.isMinimized }">
      <div class="chat-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-robot"></i>
          </div>
          <div class="header-text">
            <h3>AI Assistant</h3>
            <span class="status">{{ chatbot.isLoading ? 'Đang trả lời...' : 'Trực tuyến' }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="chatbot.toggleMinimize()" class="btn-action" title="Thu nhỏ">
            <i :class="chatbot.isMinimized ? 'fas fa-window-maximize' : 'fas fa-window-minimize'"></i>
          </button>
          <button @click="chatbot.closeChat()" class="btn-action" title="Đóng">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div v-show="!chatbot.isMinimized" class="chat-body">
        <div class="messages-container" ref="messagesContainer">
          <ChatMessage
            v-for="message in chatbot.messages"
            :key="message.id"
            :message="message"
          />
          
          <div v-if="chatbot.isLoading" class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>

          <div v-if="chatbot.error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ chatbot.error }}
          </div>
        </div>

        <div class="chat-input">
          <button @click="clearChat" class="btn-clear" title="Xóa lịch sử chat">
            <i class="fas fa-trash-alt"></i>
          </button>
          <input
            v-model="inputMessage"
            @keypress.enter="sendMessage"
            type="text"
            placeholder="Nhập tin nhắn của bạn..."
            :disabled="chatbot.isLoading"
            class="input-field"
          />
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || chatbot.isLoading"
            class="btn-send"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, nextTick, watch } from 'vue';
import { useChatbotStore } from '@/stores';
import ChatMessage from './ChatMessage.vue';

export default {
  name: 'ChatbotWindow',
  components: {
    ChatMessage
  },
  setup() {
    const chatbot = useChatbotStore();
    const inputMessage = ref('');
    const messagesContainer = ref(null);

    // Initialize welcome message
    chatbot.initWelcomeMessage();

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const sendMessage = async () => {
      if (!inputMessage.value.trim() || chatbot.isLoading) return;

      const message = inputMessage.value;
      inputMessage.value = '';
      
      await chatbot.sendMessage(message);
      scrollToBottom();
    };

    const clearChat = () => {
      if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
        chatbot.clearMessages();
        chatbot.initWelcomeMessage();
      }
    };

    // Auto scroll when new messages arrive
    watch(() => chatbot.messages.length, () => {
      scrollToBottom();
    });

    return {
      chatbot,
      inputMessage,
      messagesContainer,
      sendMessage,
      clearChat
    };
  }
}
</script>

<style scoped>
.chatbot-window {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 150px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.chatbot-window.minimized {
  height: 60px;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.header-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.status {
  font-size: 0.75rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.typing-indicator {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  justify-content: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #cbd5e0;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

 

.input-field {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field:disabled {
  background: #f1f1f1;
  cursor: not-allowed;
}

.btn-send {
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s ease;
}

.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .chatbot-window {
    bottom: 80px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
}
</style>
