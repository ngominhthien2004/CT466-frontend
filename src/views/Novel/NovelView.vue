<template>
    <div class="novel-view">
        <div class="container">
            <!-- Loading -->
            <div v-if="loading" class="loading">
                <p>Đang tải thông tin tiểu thuyết...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button @click="$router.push('/')" class="btn-back">
                    <i class="fas fa-arrow-left"></i>
                    Quay về trang chủ
                </button>
            </div>

            <!-- Content -->
            <template v-else-if="novel">
                <!-- Novel Detail -->
                <NovelDetail 
                    :novel="novel"
                    @toggle-favorite="handleToggleFavorite"
                    @read-chapter="handleReadChapter"
                />

                <!-- Chapter List -->
                <ChapterList 
                    :chapters="chapters"
                    :loading="loadingChapters"
                    @read-chapter="handleReadChapter"
                />

                <!-- Comments Section (Novel-level comments) -->
                <CommentSection
                    :comments="comments"
                    :is-authenticated="isAuthenticated"
                    :user-avatar="userAvatar"
                    :current-user-id="currentUserId"
                    :is-submitting="submittingComment"
                    @submit="handleSubmitComment"
                    @like="handleLikeComment"
                    @reply="handleReplyComment"
                    @delete="handleDeleteComment"
                />
            </template>
        </div>
    </div>
</template>

<script>
import NovelDetail from '@/components/Novel/NovelDetail.vue';
import ChapterList from '@/components/Chapter/ChapterList.vue';
import CommentSection from '@/components/Comment/CommentSection.vue';
import { NovelService, ChapterService, CommentService } from '@/services';
import { useAuthStore } from '@/stores';

export default {
    name: 'NovelView',
    components: {
        NovelDetail,
        ChapterList,
        CommentSection
    },
    data() {
        return {
            novel: null,
            chapters: [],
            comments: [],
            loading: false,
            loadingChapters: false,
            submittingComment: false,
            error: null,
            authStore: useAuthStore()
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        userAvatar() {
            return this.authStore.userAvatar || '/assets/default-avatar.svg';
        },
        currentUserId() {
            return this.authStore.user?._id || null;
        }
    },
    async mounted() {
        await this.fetchNovelDetail();
        await this.fetchChapters();
        await this.loadComments();
    },
    methods: {
        async fetchNovelDetail() {
            try {
                this.loading = true;
                this.error = null;
                const novelId = this.$route.params.id;
                
                this.novel = await NovelService.get(novelId);
                
                // Tăng view count
                await NovelService.update(novelId, { 
                    views: (this.novel.views || 0) + 1 
                });
                
            } catch (error) {
                console.error('Error fetching novel:', error);
                this.error = 'Không thể tải thông tin tiểu thuyết';
            } finally {
                this.loading = false;
            }
        },
        async fetchChapters() {
            try {
                this.loadingChapters = true;
                const novelId = this.$route.params.id;
                
                // Lấy tất cả chapters của novel này
                const allChapters = await ChapterService.getAll();
                this.chapters = allChapters.filter(c => c.novelId === novelId);
                
            } catch (error) {
                console.error('Error fetching chapters:', error);
            } finally {
                this.loadingChapters = false;
            }
        },
        async handleToggleFavorite(novelId, isFavorite) {
            try {
                await NovelService.update(novelId, { favorite: isFavorite });
                this.novel.favorite = isFavorite;
            } catch (error) {
                console.error('Error updating favorite:', error);
                alert('Không thể cập nhật yêu thích');
            }
        },
        handleReadChapter(chapterId) {
            if (chapterId === 'first') {
                // Đọc chương đầu tiên
                if (this.chapters.length > 0) {
                    const sortedChapters = [...this.chapters].sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                    chapterId = sortedChapters[0]._id;
                }
            }
            
            // Lưu lịch sử đọc
            localStorage.setItem(`reading_history_${this.novel._id}`, JSON.stringify({
                chapterId: chapterId,
                timestamp: new Date().toISOString()
            }));
            
            // Chuyển đến trang đọc chapter
            this.$router.push(`/chapters/${chapterId}`);
        },
        async loadComments() {
            try {
                const response = await CommentService.getByNovelId(this.$route.params.id);
                // Chỉ lấy comments KHÔNG có chapterId (novel-level comments) và KHÔNG có parentId (top-level)
                const allComments = Array.isArray(response) ? response : (response.data || []);
                this.comments = allComments.filter(comment => !comment.chapterId && !comment.parentId);
                console.log('Novel-level comments:', this.comments);
            } catch (error) {
                console.error('Error loading comments:', error);
                this.comments = [];
            }
        },
        async handleSubmitComment(content) {
            this.submittingComment = true;
            try {
                const commentData = {
                    novelId: this.$route.params.id,
                    userId: this.authStore.user._id,
                    userName: this.authStore.user.username,
                    userAvatar: this.authStore.user.avatar,
                    content: content
                    // Không có chapterId - đây là comment cho novel
                };
                
                await CommentService.create(commentData);
                await this.loadComments();
            } catch (error) {
                console.error('Error submitting comment:', error);
                alert('Không thể gửi bình luận. Vui lòng thử lại!');
            } finally {
                this.submittingComment = false;
            }
        },
        async handleLikeComment(commentId) {
            // Reload comments to update like count
            await this.loadComments();
        },
        async handleReplyComment(replyData) {
            try {
                const commentData = {
                    novelId: this.$route.params.id,
                    parentId: replyData.parentId,
                    userId: this.authStore.user._id,
                    userName: this.authStore.user.username,
                    userAvatar: this.authStore.user.avatar,
                    content: replyData.content
                };
                
                await CommentService.create(commentData);
                // Không reload toàn bộ comments - CommentItem sẽ tự load replies
            } catch (error) {
                console.error('Error replying to comment:', error);
                alert('Không thể gửi phản hồi. Vui lòng thử lại!');
            }
        },
        async handleDeleteComment(commentId) {
            try {
                await CommentService.delete(commentId);
                await this.loadComments();
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('Không thể xóa bình luận. Vui lòng thử lại!');
            }
        }
    }
};
</script>

<style scoped>
.novel-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem;
}

.loading,
.error {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading p {
    color: #7f8c8d;
    font-size: 1.1rem;
    margin: 0;
}

.error {
    color: #e74c3c;
}

.error i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error p {
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
}

.btn-back {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 0 1rem;
    }
}
</style>
