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
                    v-if="!isReply && currentUserId && currentUserId !== comment.userId" 
                    @click="showReportModal = true" 
                    class="action-btn report-btn"
                    title="Báo cáo bình luận vi phạm"
                >
                    <i class="fas fa-flag"></i>
                    Báo cáo
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
                    @reply="$emit('reply', $event)"
                    @delete="handleDeleteReply"
                />
            </div>
        </div>
        
        <!-- Report Modal -->
        <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-flag"></i> Báo cáo bình luận</h3>
                    <button class="close-btn" @click="showReportModal = false">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="modal-description">
                        Hãy cho chúng tôi biết lý do bạn báo cáo bình luận này:
                    </p>
                    <textarea 
                        v-model="reportReason" 
                        placeholder="Nhập lý do báo cáo (tối thiểu 10 ký tự)..."
                        rows="4"
                        maxlength="500"
                    ></textarea>
                    <div class="char-count">{{ reportReason.length }}/500</div>
                </div>
                <div class="modal-footer">
                    <button @click="showReportModal = false" class="btn-cancel">Hủy</button>
                    <button 
                        @click="submitReport" 
                        :disabled="reportReason.trim().length < 10"
                        class="btn-submit btn-danger"
                    >
                        <i class="fas fa-flag"></i>
                        Gửi báo cáo
                    </button>
                </div>
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
            likeCount: 0,
            showReportModal: false,
            reportReason: ''
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
                // Thêm @userName vào đầu nội dung reply
                const replyWithMention = `@${this.comment.userName} ${this.replyContent.trim()}`;
                
                this.$emit('reply', {
                    parentId: this.comment._id,
                    content: replyWithMention
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
        },
        async handleDeleteReply(replyId) {
            // Emit lên parent để xóa (không cần confirmation ở đây vì parent sẽ xử lý)
            this.$emit('delete', replyId);
        },
        async submitReport() {
            if (this.reportReason.trim().length < 10) {
                alert('Vui lòng nhập lý do báo cáo (tối thiểu 10 ký tự)');
                return;
            }
            
            try {
                await CommentService.reportComment(this.comment._id, {
                    userId: this.currentUserId,
                    reason: this.reportReason.trim()
                });
                
                alert('Đã gửi báo cáo thành công. Cảm ơn bạn đã giúp duy trì cộng đồng văn minh!');
                this.showReportModal = false;
                this.reportReason = '';
            } catch (error) {
                console.error('Error reporting comment:', error);
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.');
                }
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

.report-btn:hover {
    color: #f39c12;
}

/* Reply Form */
.reply-form {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.reply-to {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.reply-to strong {
    color: #c9a9a6;
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

/* Report Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow: auto;
    animation: slideUp 0.3s;
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #ecf0f1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-header h3 i {
    color: #f39c12;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #95a5a6;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
}

.close-btn:hover {
    background: #ecf0f1;
    color: #2c3e50;
}

.modal-body {
    padding: 1.5rem;
}

.modal-description {
    margin: 0 0 1rem 0;
    color: #7f8c8d;
    font-size: 0.95rem;
}

.modal-body textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    font-size: 0.95rem;
    min-height: 100px;
}

.modal-body textarea:focus {
    outline: none;
    border-color: #f39c12;
}

.char-count {
    text-align: right;
    font-size: 0.85rem;
    color: #95a5a6;
    margin-top: 0.25rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #ecf0f1;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.modal-footer .btn-cancel,
.modal-footer .btn-submit {
    padding: 0.6rem 1.25rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-footer .btn-cancel {
    background: #e9ecef;
    color: #495057;
}

.modal-footer .btn-cancel:hover {
    background: #dee2e6;
}

.modal-footer .btn-submit {
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    color: white;
}

.modal-footer .btn-submit.btn-danger {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.modal-footer .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.3);
}

.modal-footer .btn-submit.btn-danger:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.modal-footer .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
