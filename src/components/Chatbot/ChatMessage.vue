<template>
  <div class="chat-message" :class="{ 'user-message': isUser, 'ai-message': !isUser }">
    <div class="message-avatar">
      <i v-if="isUser" class="fas fa-user"></i>
      <i v-else class="fas fa-robot"></i>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">{{ isUser ? 'Bạn' : 'AI Assistant' }}</span>
        <span class="message-time">{{ formattedTime }}</span>
      </div>
      <div class="message-text" v-html="formattedContent"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    isUser() {
      return this.message.role === 'user';
    },
    formattedTime() {
      const date = new Date(this.message.timestamp);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },
    formattedContent() {
      // Simple markdown-like formatting
      let text = this.message.content;
      
      // Convert **bold** to <strong>
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Convert *italic* to <em>
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      // Convert line breaks to <br>
      text = text.replace(/\n/g, '<br>');
      
      // Convert bullet points
      text = text.replace(/^• (.+)$/gm, '<div class="bullet-point">• $1</div>');
      
      return text;
    }
  }
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.message-author {
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
}

.message-time {
  font-size: 0.75rem;
  color: #95a5a6;
}

.message-text {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #2c3e50;
  word-wrap: break-word;
}

.user-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-message .message-text {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.message-text :deep(strong) {
  font-weight: 700;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-text :deep(.bullet-point) {
  margin: 0.25rem 0;
  padding-left: 0.5rem;
}
</style>
