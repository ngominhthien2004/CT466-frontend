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
                    :is-favorite="isNovelFavorited"
                    @toggle-favorite="handleToggleFavorite"
                    @read-chapter="handleReadChapter"
                    @updated="handleNovelUpdated"
                />

                <!-- Chapter List -->
                <ChapterList 
                    :chapters="chapters"
                    :loading="loadingChapters"
                    :novel-id="novelId"
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

        <!-- Delete Confirmation Modal -->
        <ConfirmModal
            v-model:show="showDeleteModal"
            title="Xóa bình luận"
            message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
            confirm-text="Xóa"
            cancel-text="Hủy"
            confirm-type="danger"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script>
import NovelDetail from '@/components/Novel/NovelDetail.vue';
import ChapterList from '@/components/Chapter/ChapterList.vue';
import CommentSection from '@/components/Comment/CommentSection.vue';
import ConfirmModal from '@/components/Common/ConfirmModal.vue';
import { NovelService, ChapterService, CommentService } from '@/services';
import { useAuthStore, useNovelStore } from '@/stores';

export default {
    name: 'NovelView',
    components: {
        NovelDetail,
        ChapterList,
        CommentSection,
        ConfirmModal
    },
    data() {
        return {
            novel: null,
            chapters: [],
            comments: [],
            loading: false,
            loadingChapters: false,
            submittingComment: false,
            deleting: false,
            showDeleteModal: false,
            deleteTargetId: null,
            error: null,
            authStore: useAuthStore(),
            novelStore: useNovelStore()
        };
    },
    computed: {
        novelId() {
            return this.$route.params.id;
        },
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        userAvatar() {
            return this.authStore.userAvatar || '/assets/default-avatar.svg';
        },
        currentUserId() {
            return this.authStore.user?._id || null;
        },
        isNovelFavorited() {
            const userId = this.authStore.user?._id;
            if (!userId || !this.novel) return false;
            return this.novel.favoritedBy?.includes(userId) || false;
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
                
                // Tăng view count chỉ lần đầu load
                const currentViews = this.novel.views || 0;
                await NovelService.update(novelId, { 
                    views: currentViews + 1 
                });
                // Update local novel object with new view count
                this.novel.views = currentViews + 1;
                
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
        async handleToggleFavorite(novelId) {
            try {
                const userId = this.authStore.user?._id;
                if (!userId) {
                    alert('Vui lòng đăng nhập để yêu thích truyện');
                    return;
                }

                // Use store to toggle favorite - this will update all pages
                const updatedNovel = await this.novelStore.toggleFavoriteWithApi(novelId, userId);
                
                // Update local state with response from server
                this.novel.favoritedBy = updatedNovel.favoritedBy || [];
                this.novel.likes = updatedNovel.likes || 0;
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
        async handleNovelUpdated(updated) {
            console.log('NovelView received updated novel:', updated);
            // Update all fields from server response
            // But preserve the current view count (which was incremented on page load)
            this.novel = {
                ...updated,
                views: this.novel.views || updated.views,
                likes: this.novel.likes || updated.likes,
                favorite: this.novel.favorite !== undefined ? this.novel.favorite : updated.favorite
            };
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
            console.log('handleDeleteComment called with:', commentId);
            this.deleteTargetId = commentId;
            this.showDeleteModal = true;
            console.log('showDeleteModal set to:', this.showDeleteModal);
        },
        async confirmDelete() {
            if (this.deleting || !this.deleteTargetId) return;
            
            this.deleting = true;
            try {
                await CommentService.delete(this.deleteTargetId);
                // Force reload comments
                this.comments = [];
                await this.loadComments();
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('Không thể xóa bình luận. Vui lòng thử lại!');
            } finally {
                this.deleting = false;
                this.deleteTargetId = null;
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

/* Utility styles moved to utilities.css */

/* Custom container styling */
.loading,
.error {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
