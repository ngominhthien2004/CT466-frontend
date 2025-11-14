<template>
    <div class="comment-item">
        <img :src="avatar" alt="Avatar" class="comment-avatar" />
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">{{ comment.userName || 'Người dùng' }}</span>
                <span class="comment-time">{{ formattedTime }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-actions">
                <button @click="$emit('like', comment._id)" class="action-btn">
                    <i class="far fa-thumbs-up"></i>
                    Thích ({{ comment.likes || 0 }})
                </button>
                <button @click="$emit('reply', comment._id)" class="action-btn">
                    <i class="fas fa-reply"></i>
                    Trả lời
                </button>
                <button 
                    v-if="canDelete" 
                    @click="$emit('delete', comment._id)" 
                    class="action-btn delete-btn"
                >
                    <i class="fas fa-trash"></i>
                    Xóa
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CommentItem',
    props: {
        comment: {
            type: Object,
            required: true
        },
        currentUserId: {
            type: String,
            default: null
        }
    },
    emits: ['like', 'reply', 'delete'],
    computed: {
        avatar() {
            return this.comment.avatar || '/assets/default-avatar.svg';
        },
        canDelete() {
            return this.currentUserId && this.currentUserId === this.comment.userId;
        },
        formattedTime() {
            const date = new Date(this.comment.createdAt);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;
            
            return date.toLocaleDateString('vi-VN');
        }
    }
};
</script>

<style scoped>
.comment-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
}

.comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.comment-content {
    flex: 1;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.comment-author {
    font-weight: 700;
    color: #2c3e50;
}

.comment-time {
    font-size: 0.85rem;
    color: #95a5a6;
}

.comment-text {
    margin: 0 0 1rem 0;
    line-height: 1.6;
    color: #2c3e50;
}

.comment-actions {
    display: flex;
    gap: 1rem;
}

.action-btn {
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.3s;
    padding: 0.25rem 0.5rem;
}

.action-btn:hover {
    color: #c9a9a6;
}

.delete-btn:hover {
    color: #e74c3c;
}
</style>
