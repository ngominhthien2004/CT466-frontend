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
                <button @click="$router.push('/')" class="btn btn-secondary">
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
                    :novel="novel"
                    @read-chapter="handleReadChapter"
                    @delete-chapter="handleDeleteChapter"
                />

                <!-- Comments Section (Novel-level comments) -->
                <CommentSection
                    :comments="comments"
                    :is-authenticated="isAuthenticated"
                    :user-avatar="userAvatar"
                    :current-user-id="currentUserId"
                    :is-submitting="submittingComment"
                    :reload-trigger="reloadTrigger"
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

        <!-- Delete Chapter Modal -->
        <DeleteModal
            :show="showDeleteChapterModal"
            :item-name="chapterToDelete?.title"
            message="Bạn có chắc chắn muốn XÓA chương này? Hành động này không thể hoàn tác!"
            @confirm="confirmDeleteChapter"
            @cancel="showDeleteChapterModal = false"
        />
        
        <!-- Notification Modal -->
        <NotificationModal
            :show="showNotification"
            :type="notificationType"
            :message="notificationMessage"
            :auto-close="notificationAutoClose"
            @close="() => { showNotification = false; notificationAutoClose = false; notificationMessage = ''; notificationType = 'info' }"
        />
    </div>
</template>

<script>
import NovelDetail from '@/components/Novel/NovelDetail.vue';
import ChapterList from '@/components/Chapter/ChapterList.vue';
import CommentSection from '@/components/Comment/CommentSection.vue';
import ConfirmModal from '@/components/Common/ConfirmModal.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import { NovelService, ChapterService, CommentService } from '@/services';
import { useAuthStore, useNovelStore } from '@/stores';

export default {
    name: 'NovelView',
    components: {
        NovelDetail,
        ChapterList,
        CommentSection,
        ConfirmModal,
        DeleteModal,
        NotificationModal
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
            novelStore: useNovelStore(),
            showDeleteChapterModal: false,
            chapterToDelete: null,
            reloadTrigger: 0
            ,
            // notification state
            showNotification: false,
            notificationMessage: '',
            notificationType: 'info',
            notificationAutoClose: false
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
                    this.showNotification = true;
                    this.notificationType = 'warning';
                    this.notificationMessage = 'Vui lòng đăng nhập để yêu thích';
                    return;
                }

                // Use store to toggle favorite - this will update all pages
                const updatedNovel = await this.novelStore.toggleFavoriteWithApi(novelId, userId);
                
                // Update local state with response from server
                this.novel.favoritedBy = updatedNovel.favoritedBy || [];
                this.novel.likes = updatedNovel.likes || 0;
            } catch (error) {
                console.error('Error updating favorite:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể cập nhật yêu thích';
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
        async handleDeleteChapter(chapterId) {
            const chapter = this.chapters.find(c => c._id === chapterId);
            this.chapterToDelete = chapter;
            this.showDeleteChapterModal = true;
        },

        async confirmDeleteChapter() {
            if (!this.chapterToDelete) return;

            try {
                await ChapterService.delete(this.chapterToDelete._id);
                this.showNotification = true;
                this.notificationType = 'success';
                this.notificationMessage = 'Xóa chương thành công!';
                this.notificationAutoClose = true;
                this.showDeleteChapterModal = false;
                this.chapterToDelete = null;
                await this.loadChapters();
            } catch (error) {
                console.error('Error deleting chapter:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể xóa chương!';
            }
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
                };
                
                await CommentService.create(commentData);
                await this.loadComments();
            } catch (error) {
                console.error('Error submitting comment:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể gửi bình luận. Vui lòng thử lại!';
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
                    novelId: this.novelId,
                    parentId: replyData.parentId,
                    userId: this.authStore.user._id,
                    userName: this.authStore.user.username,
                    userAvatar: this.authStore.user.avatar,
                    content: replyData.content
                };
                
                await CommentService.create(commentData);
                
                // Tăng reloadTrigger để trigger reload replies
                this.reloadTrigger++;
                
                // Cũng reload toàn bộ comments để đảm bảo
                await this.loadComments();
            } catch (error) {
                console.error('Error replying to comment:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể gửi phản hồi. Vui lòng thử lại!';
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
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể xóa bình luận. Vui lòng thử lại!';
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

/* Custom container styling */
.loading,
.error {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 0 1rem;
    }
}
</style>
