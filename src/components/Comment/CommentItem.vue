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
                <button @click="handleLike" class="action-btn" :class="{ 'liked': isLiked }">
                    <i :class="isLiked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                    {{ isLiked ? 'Đã thích' : 'Thích' }} ({{ likeCount }})
                </button>
                <button @click="toggleReply" class="action-btn">
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
            
            <!-- Reply Form -->
            <div v-if="showReplyForm" class="reply-form">
                <div class="reply-to">
                    Trả lời <strong>@{{ comment.userName }}</strong>
                </div>
                <textarea 
                    v-model="replyContent" 
                    placeholder="Viết phản hồi của bạn..."
                    @keydown.ctrl.enter="submitReply"
                    rows="3"
                ></textarea>
                <div class="reply-actions">
                    <button @click="toggleReply" class="btn-cancel">Hủy</button>
                    <button @click="submitReply" :disabled="!replyContent.trim()" class="btn-submit">
                        Gửi phản hồi
                    </button>
                </div>
            </div>
            
            <!-- Replies List -->
            <div v-if="replies.length > 0" class="replies-list">
                <CommentItem 
                    v-for="reply in replies" 
                    :key="reply._id"
                    :comment="reply"
                    :currentUserId="currentUserId"
                    :isReply="true"
                    @like="$emit('like', $event)"
                    @delete="$emit('delete', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import CommentService from '@/services/comment.service';

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
        },
        isReply: {
            type: Boolean,
            default: false
        }
    },
    emits: ['like', 'reply', 'delete'],
    data() {
        return {
            showReplyForm: false,
            replyContent: '',
            replies: [],
            isLiked: false,
            likeCount: 0
        };
    },
    computed: {
        avatar() {
            return this.comment.userAvatar || this.comment.avatar || '/assets/default-avatar.svg';
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
    },
    mounted() {
        this.checkLikeStatus();
        this.loadReplies();
    },
    watch: {
        'comment.likedBy': {
            handler() {
                this.checkLikeStatus();
            },
            deep: true
        }
    },
    methods: {
        checkLikeStatus() {
            const likedBy = this.comment.likedBy || [];
            this.isLiked = likedBy.includes(this.currentUserId);
            this.likeCount = likedBy.length;
        },
        async handleLike() {
            if (!this.currentUserId) {
                alert('Vui lòng đăng nhập để thích bình luận');
                return;
            }
            
            try {
                if (this.isLiked) {
                    await CommentService.unlike(this.comment._id, this.currentUserId);
                    this.isLiked = false;
                    this.likeCount--;
                } else {
                    await CommentService.like(this.comment._id, this.currentUserId);
                    this.isLiked = true;
                    this.likeCount++;
                }
                this.$emit('like', this.comment._id);
            } catch (error) {
                console.error('Error liking comment:', error);
                alert('Có lỗi xảy ra khi thích bình luận');
            }
        },
        toggleReply() {
            if (!this.currentUserId) {
                alert('Vui lòng đăng nhập để trả lời bình luận');
                return;
            }
            this.showReplyForm = !this.showReplyForm;
            if (!this.showReplyForm) {
                this.replyContent = '';
            }
        },
        async submitReply() {
            if (!this.replyContent.trim()) return;
            
            try {
                this.$emit('reply', {
                    parentId: this.comment._id,
                    content: this.replyContent
                });
                
                this.replyContent = '';
                this.showReplyForm = false;
                
                // Reload replies after submission
                await this.loadReplies();
            } catch (error) {
                console.error('Error submitting reply:', error);
            }
        },
        async loadReplies() {
            if (this.isReply) return; // Không load replies cho reply
            
            try {
                this.replies = await CommentService.getReplies(this.comment._id);
            } catch (error) {
                console.error('Error loading replies:', error);
                this.replies = [];
            }
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

.action-btn.liked {
    color: #c9a9a6;
    font-weight: 600;
}

.delete-btn:hover {
    color: #e74c3c;
}

/* Reply Form */
.reply-form {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.reply-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    font-size: 0.95rem;
}

.reply-form textarea:focus {
    outline: none;
    border-color: #c9a9a6;
}

.reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.btn-cancel,
.btn-submit {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
}

.btn-cancel {
    background: #e9ecef;
    color: #495057;
}

.btn-cancel:hover {
    background: #dee2e6;
}

.btn-submit {
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.3);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Replies List */
.replies-list {
    margin-top: 1rem;
    padding-left: 1.5rem;
    border-left: 2px solid #e9ecef;
}

.replies-list .comment-item {
    margin-top: 0.75rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>
