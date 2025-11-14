<template>
    <div class="comment-form">
        <img :src="userAvatar" alt="Avatar" class="user-avatar" />
        <div class="form-content">
            <textarea
                v-model="commentText"
                placeholder="Viết bình luận của bạn..."
                rows="3"
                class="comment-input"
                @keydown.ctrl.enter="handleSubmit"
            ></textarea>
            <div class="form-actions">
                <span class="hint-text">Ctrl + Enter để gửi</span>
                <button 
                    @click="handleSubmit" 
                    :disabled="!commentText.trim() || isSubmitting" 
                    class="btn-submit"
                >
                    <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                    {{ isSubmitting ? 'Đang gửi...' : 'Gửi bình luận' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CommentForm',
    props: {
        userAvatar: {
            type: String,
            default: '/assets/default-avatar.svg'
        },
        isSubmitting: {
            type: Boolean,
            default: false
        }
    },
    emits: ['submit'],
    data() {
        return {
            commentText: ''
        };
    },
    methods: {
        handleSubmit() {
            if (!this.commentText.trim() || this.isSubmitting) return;
            
            this.$emit('submit', this.commentText.trim());
            this.commentText = '';
        }
    }
};
</script>

<style scoped>
.comment-form {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.form-content {
    flex: 1;
}

.comment-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    margin-bottom: 1rem;
    transition: border-color 0.3s;
}

.comment-input:focus {
    outline: none;
    border-color: #c9a9a6;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hint-text {
    font-size: 0.85rem;
    color: #95a5a6;
}

.btn-submit {
    background: #c9a9a6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
    background: #b8a39e;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(201, 169, 166, 0.3);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: default;
}

@media (max-width: 768px) {
    .comment-form {
        flex-direction: column;
    }
    
    .hint-text {
        display: none;
    }
}
</style>
