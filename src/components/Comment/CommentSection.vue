<template>
    <div class="comments-section">
        <h3 class="section-title">
            <i class="fas fa-comments"></i>
            Bình luận ({{ comments.length }})
        </h3>

        <!-- Comment Form -->
        <CommentForm
            v-if="isAuthenticated"
            :user-avatar="userAvatar"
            :is-submitting="isSubmitting"
            @submit="handleSubmitComment"
        />
        
        <!-- Login Prompt -->
        <div v-else class="login-prompt">
            <p>Vui lòng <router-link to="/login">đăng nhập</router-link> để bình luận</p>
        </div>

        <!-- Comments List -->
        <CommentList
            :comments="comments"
            :current-user-id="currentUserId"
            @like="handleLike"
            @reply="handleReply"
            @delete="handleDelete"
        />
    </div>
</template>

<script>
import CommentForm from './CommentForm.vue';
import CommentList from './CommentList.vue';

export default {
    name: 'CommentSection',
    components: {
        CommentForm,
        CommentList
    },
    props: {
        comments: {
            type: Array,
            default: () => []
        },
        isAuthenticated: {
            type: Boolean,
            default: false
        },
        userAvatar: {
            type: String,
            default: '/assets/default-avatar.svg'
        },
        currentUserId: {
            type: String,
            default: null
        },
        isSubmitting: {
            type: Boolean,
            default: false
        }
    },
    emits: ['submit', 'like', 'reply', 'delete'],
    methods: {
        handleSubmitComment(content) {
            this.$emit('submit', content);
        },
        handleLike(commentId) {
            this.$emit('like', commentId);
        },
        handleReply(commentId) {
            this.$emit('reply', commentId);
        },
        handleDelete(commentId) {
            if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                this.$emit('delete', commentId);
            }
        }
    }
};
</script>

<style scoped>
.comments-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #2c3e50;
}

.login-prompt {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.login-prompt p {
    margin: 0;
    font-size: 1rem;
    color: #7f8c8d;
}

.login-prompt a {
    color: #c9a9a6;
    font-weight: 600;
    text-decoration: none;
}

.login-prompt a:hover {
    text-decoration: underline;
}
</style>
