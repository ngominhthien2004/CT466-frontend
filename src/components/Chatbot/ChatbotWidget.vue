<template>
  <div class="chatbot-widget">
    <!-- Chatbot Window -->
    <ChatbotWindow />

    <!-- Floating Button -->
    <button
      @click="chatbot.toggleChat()"
      class="chatbot-button"
      :class="{ active: chatbot.isOpen }"
      title="Chat với AI Assistant"
    >
      <Transition name="icon-swap" mode="out-in">
        <i v-if="chatbot.isOpen" key="close" class="fas fa-times"></i>
        <i v-else key="chat" class="fas fa-comments"></i>
      </Transition>
      
      <!-- Notification badge -->
      <span v-if="chatbot.hasNewMessage && !chatbot.isOpen" class="notification-badge">
        <i class="fas fa-circle"></i>
      </span>

      <!-- Pulse effect -->
      <span class="pulse-ring"></span>
    </button>
  </div>
</template>

<script>
import { useChatbotStore } from '@/stores';
import ChatbotWindow from './ChatbotWindow.vue';

export default {
  name: 'ChatbotWidget',
  components: {
    ChatbotWindow
  },
  setup() {
    const chatbot = useChatbotStore();

    return {
      chatbot
    };
  }
}
</script>

<style scoped>
.chatbot-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}

.chatbot-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.chatbot-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.chatbot-button.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.chatbot-button:active {
  transform: scale(0.95);
}

/* Icon transition */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.2s ease;
}

.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

/* Notification badge */
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  animation: bounce 1s infinite;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Pulse ring effect */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(102, 126, 234, 0.6);
  animation: pulse 2s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.chatbot-button.active .pulse-ring {
  display: none;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .chatbot-widget {
    bottom: 15px;
    right: 15px;
  }

  .chatbot-button {
    width: 56px;
    height: 56px;
    font-size: 1.3rem;
  }
}

/* Accessibility */
.chatbot-button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .pulse-ring,
  .notification-badge {
    animation: none;
  }
}
</style>
