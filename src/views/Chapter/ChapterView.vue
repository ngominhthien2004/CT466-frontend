<template>
    <div class="chapter-view-page">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải nội dung chương...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Không thể tải chương</h3>
            <p>{{ error }}</p>
            <button @click="loadChapter" class="btn btn-secondary">
                <i class="fas fa-redo"></i>
                Thử lại
            </button>
        </div>

        <!-- Chapter Content -->
        <div v-else class="chapter-container">
            <!-- Header -->
            <div class="chapter-header">
                <div class="header-content">
                    <!-- Breadcrumb -->
                    <div class="breadcrumb">
                        <a href="/" @click.prevent="goHome">
                            <i class="fas fa-home"></i>
                            Trang chủ
                        </a>
                        <i class="fas fa-chevron-right"></i>
                        <a :href="`/novels/${novelId}`" @click.prevent="goToNovel">
                            {{ novel?.title || 'Novel' }}
                        </a>
                        <i class="fas fa-chevron-right"></i>
                        <span>{{ chapter?.title || `Chương ${chapter?.chapterNumber}` }}</span>
                    </div>

                    <!-- Chapter Title -->
                    <h1 class="chapter-title">
                        {{ chapter?.title || `Chương ${chapter?.chapterNumber}` }}
                    </h1>

                    <!-- Chapter Info -->
                    <div class="chapter-info">
                        <span class="info-item">
                            <i class="fas fa-book"></i>
                            {{ novel?.title }}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-user"></i>
                            {{ novel?.author || 'Đang cập nhật' }}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            {{ formatDate(chapter?.createdAt) }}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-eye"></i>
                            {{ formatNumber(chapter?.views || 0) }} lượt xem
                        </span>
                    </div>
                </div>
            </div>

            <!-- Navigation Bar -->
            <div class="navigation-bar sticky">
                <div class="nav-content">
                    <!-- Left: Previous -->
                    <button 
                        @click="goToPreviousChapter" 
                        :disabled="!previousChapter"
                        class="nav-btn nav-prev"
                        title="Chương trước (←)"
                    >
                        <i class="fas fa-chevron-left"></i>
                        <span class="btn-text">Chương trước</span>
                    </button>

                    <!-- Center: Chapter List Dropdown -->
                    <div class="chapter-selector">
                        <button @click="toggleChapterList" class="btn btn-chapter-list">
                            <i class="fas fa-list"></i>
                            <span>Danh sách chương</span>
                            <i class="fas fa-caret-down"></i>
                        </button>
                        
                        <!-- Dropdown -->
                        <div v-if="showChapterList" class="chapter-dropdown">
                            <div class="dropdown-header">
                                <input
                                    v-model="chapterSearchQuery"
                                    type="text"
                                    placeholder="Tìm chương..."
                                    class="chapter-search"
                                    @click.stop
                                />
                            </div>
                            <div class="dropdown-list">
                                <a
                                    v-for="chap in filteredChapters"
                                    :key="chap._id"
                                    :href="`/novels/${novelId}/chapters/${chap._id}`"
                                    @click.prevent="goToChapter(chap._id)"
                                    :class="['chapter-item', { active: chap._id === chapterId }]"
                                >
                                    <span class="chapter-number">{{ chap.chapterNumber }}</span>
                                    <span class="chapter-name">{{ chap.title }}</span>
                                    <i v-if="chap._id === chapterId" class="fas fa-check"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Next -->
                    <button 
                        @click="goToNextChapter" 
                        :disabled="!nextChapter"
                        class="nav-btn nav-next"
                        title="Chương sau (→)"
                    >
                        <span class="btn-text">Chương sau</span>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- Reading Settings -->
            <div class="reading-settings">
                <button @click="decreaseFontSize" class="setting-btn" title="Giảm cỡ chữ">
                    <i class="fas fa-font"></i>
                    <i class="fas fa-minus"></i>
                </button>
                <button @click="increaseFontSize" class="setting-btn" title="Tăng cỡ chữ">
                    <i class="fas fa-font"></i>
                    <i class="fas fa-plus"></i>
                </button>
                <button @click="toggleTheme" class="setting-btn" title="Đổi nền">
                    <i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
                </button>
                <button @click="toggleFullscreen" class="setting-btn" title="Toàn màn hình">
                    <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
                </button>
            </div>

            <!-- Chapter Content -->
            <div 
                class="chapter-content" 
                :class="{ 'dark-mode': isDarkMode }"
                :style="{ fontSize: fontSize + 'px' }"
            >
                <div class="content-body" v-html="formattedContent"></div>
            </div>

            <!-- Bottom Navigation -->
            <div class="bottom-navigation">
                <button 
                    @click="goToPreviousChapter" 
                    :disabled="!previousChapter"
                    class="nav-btn nav-prev"
                >
                    <i class="fas fa-chevron-left"></i>
                    Chương trước
                </button>

                <a :href="`/novels/${novelId}`" @click.prevent="goToNovel" class="btn btn-nav">
                    <i class="fas fa-book"></i>
                    Về trang tiểu thuyết
                </a>

                <button 
                    @click="goToNextChapter" 
                    :disabled="!nextChapter"
                    class="nav-btn nav-next"
                >
                    Chương sau
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <!-- Comments Section -->
            <CommentSection
                :comments="comments"
                :is-authenticated="isAuthenticated"
                :user-avatar="userAvatar"
                :current-user-id="authStore.user?._id"
                :is-submitting="submittingComment"
                :reload-trigger="reloadTrigger"
                @submit="handleSubmitComment"
                @like="handleLikeComment"
                @reply="handleReplyComment"
                @delete="handleDeleteComment"
            />
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
import { ChapterService, NovelService, CommentService, ReadingHistoryService } from '@/services';
import { useAuthStore } from '@/stores';
import CommentSection from '@/components/Comment/CommentSection.vue';
import ConfirmModal from '@/components/Common/ConfirmModal.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';

export default {
    name: 'ChapterView',
    components: {
        CommentSection,
        ConfirmModal,
        NotificationModal
    },
    data() {
        return {
            chapterId: this.$route.params.chapterId,
            novelId: this.$route.params.id || null, // Will be fetched from chapter data if not in URL
            chapter: null,
            novel: null,
            allChapters: [],
            comments: [],
            loading: false,
            error: null,
            authStore: useAuthStore(),
            
            // Navigation
            previousChapter: null,
            nextChapter: null,
            showChapterList: false,
            chapterSearchQuery: '',
            
            // Reading settings
            fontSize: 18,
            isDarkMode: false,
            isFullscreen: false,
            
            // Comments
            submittingComment: false,
            deleting: false,
            showDeleteModal: false,
            deleteTargetId: null,
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
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        userAvatar() {
            return this.authStore.userAvatar || '/assets/default-avatar.svg';
        },
        formattedContent() {
            if (!this.chapter?.content) return '<p>Nội dung đang được cập nhật...</p>';
            
            // Format content with paragraphs
            return this.chapter.content
                .split('\n')
                .filter(line => line.trim())
                .map(line => `<p>${line}</p>`)
                .join('');
        },
        filteredChapters() {
            if (!this.chapterSearchQuery) return this.allChapters;
            
            const query = this.chapterSearchQuery.toLowerCase();
            return this.allChapters.filter(chap =>
                chap.title?.toLowerCase().includes(query) ||
                chap.chapterNumber?.toString().includes(query)
            );
        }
    },
    watch: {
        // Watch for route changes (when navigating between chapters)
        '$route.params.chapterId': {
            handler(newChapterId) {
                if (newChapterId && newChapterId !== this.chapterId) {
                    this.chapterId = newChapterId;
                    this.loadChapter();
                    // Scroll to top when changing chapter
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    },
    async mounted() {
        await this.loadChapter();
        this.loadSettings();
        this.saveToHistory();
        
        // Close dropdown when clicking outside
        document.addEventListener('click', this.handleClickOutside);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyPress);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        async loadChapter() {
            this.loading = true;
            this.error = null;
            
            try {
                // Load chapter details
                const chapterResponse = await ChapterService.get(this.chapterId);
                this.chapter = chapterResponse.data || chapterResponse;
                
                // Get novelId from chapter if not in route params
                if (!this.novelId && this.chapter.novelId) {
                    this.novelId = this.chapter.novelId;
                }
                
                // Load novel details
                const novelResponse = await NovelService.get(this.novelId);
                this.novel = novelResponse.data || novelResponse;
                
                // Load all chapters of this novel
                const chaptersResponse = await ChapterService.getByNovelId(this.novelId);
                this.allChapters = (chaptersResponse.data || chaptersResponse || [])
                    .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
                
                // Find previous and next chapters
                this.findAdjacentChapters();
                
                // Load comments
                await this.loadComments();
                
                // Update view count
                this.updateViewCount();
                
            } catch (error) {
                console.error('Error loading chapter:', error);
                this.error = error.response?.data?.message || 'Không thể tải nội dung chương. Vui lòng thử lại sau.';
            } finally {
                this.loading = false;
            }
        },
        findAdjacentChapters() {
            const currentIndex = this.allChapters.findIndex(ch => ch._id === this.chapterId);
            
            if (currentIndex > 0) {
                this.previousChapter = this.allChapters[currentIndex - 1];
            } else {
                this.previousChapter = null;
            }
            
            if (currentIndex < this.allChapters.length - 1) {
                this.nextChapter = this.allChapters[currentIndex + 1];
            } else {
                this.nextChapter = null;
            }
        },
        async loadComments() {
            try {
                const response = await CommentService.getByChapterId(this.chapterId);
                console.log('Raw response from API:', response);
                
                // Parse response
                let allComments = [];
                if (Array.isArray(response)) {
                    allComments = response;
                } else if (response && response.data) {
                    allComments = Array.isArray(response.data) ? response.data : [];
                } else {
                    allComments = [];
                }
                
                // QUAN TRỌNG: Chỉ lấy comments có chapterId khớp và KHÔNG có parentId (top-level)
                this.comments = allComments.filter(comment => 
                    comment.chapterId && comment.chapterId === this.chapterId && !comment.parentId
                );
                
                console.log('Filtered comments for chapter:', this.comments);
            } catch (error) {
                console.error('Error loading comments:', error);
                this.comments = [];
            }
        },
        async updateViewCount() {
            try {
                // Increment view count
                await ChapterService.update(this.chapterId, {
                    views: (this.chapter.views || 0) + 1
                });
            } catch (error) {
                console.error('Error updating view count:', error);
            }
        },
        async saveToHistory() {
            if (!this.isAuthenticated) return;
            
            try {
                const historyData = {
                    novelId: this.novelId,
                    chapterId: this.chapterId,
                    novelTitle: this.novel?.title,
                    novelCover: this.novel?.coverImage,
                    chapterTitle: this.chapter?.title,
                    chapterNumber: this.chapter?.chapterNumber,
                    lastRead: new Date()
                };
                
                await ReadingHistoryService.addToHistory(this.authStore.user._id, historyData);
            } catch (error) {
                console.error('Error saving to history:', error);
            }
        },
        async handleSubmitComment(content) {
            this.submittingComment = true;
            try {
                const commentData = {
                    novelId: this.novelId,
                    chapterId: this.chapterId,
                    userId: this.authStore.user._id,
                    userName: this.authStore.user.username,
                    userAvatar: this.authStore.user.avatar,
                    content: content
                };
                
                await CommentService.create(commentData);
                
                // Reload comments
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
        async handleLikeComment(commentId) {
            // Reload comments to update like count
            await this.loadComments();
        },
        async handleReplyComment(replyData) {
            try {
                const commentData = {
                    novelId: this.novelId,
                    chapterId: this.chapterId,
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
            this.deleteTargetId = commentId;
            this.showDeleteModal = true;
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
        },
        toggleChapterList() {
            this.showChapterList = !this.showChapterList;
        },
        handleClickOutside(event) {
            const dropdown = this.$el?.querySelector('.chapter-selector');
            if (dropdown && !dropdown.contains(event.target)) {
                this.showChapterList = false;
            }
        },
        handleKeyPress(event) {
            // Arrow keys for navigation
            if (event.key === 'ArrowLeft' && this.previousChapter) {
                this.goToPreviousChapter();
            } else if (event.key === 'ArrowRight' && this.nextChapter) {
                this.goToNextChapter();
            }
        },
        goToPreviousChapter() {
            if (this.previousChapter) {
                this.$router.push(`/novels/${this.novelId}/chapters/${this.previousChapter._id}`);
            }
        },
        goToNextChapter() {
            if (this.nextChapter) {
                this.$router.push(`/novels/${this.novelId}/chapters/${this.nextChapter._id}`);
            }
        },
        goToChapter(chapterId) {
            this.$router.push(`/novels/${this.novelId}/chapters/${chapterId}`);
        },
        goToNovel() {
            this.$router.push(`/novels/${this.novelId}`);
        },
        goHome() {
            this.$router.push('/');
        },
        
        // Reading settings
        increaseFontSize() {
            if (this.fontSize < 28) {
                this.fontSize += 2;
                this.saveSettings();
            }
        },
        decreaseFontSize() {
            if (this.fontSize > 12) {
                this.fontSize -= 2;
                this.saveSettings();
            }
        },
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            this.saveSettings();
        },
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                this.isFullscreen = true;
            } else {
                document.exitFullscreen();
                this.isFullscreen = false;
            }
        },
        saveSettings() {
            localStorage.setItem('reading_settings', JSON.stringify({
                fontSize: this.fontSize,
                isDarkMode: this.isDarkMode
            }));
        },
        loadSettings() {
            const saved = localStorage.getItem('reading_settings');
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    this.fontSize = settings.fontSize || 18;
                    this.isDarkMode = settings.isDarkMode || false;
                } catch (error) {
                    console.error('Error loading settings:', error);
                }
            }
        },
        
        // Formatters
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        },
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }
    }
};
</script>

<style scoped>
.chapter-view-page {
    min-height: 100vh;
    background: #f8f9fa;
}

/* Utility styles moved to utilities.css */


/* Header */
.chapter-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 2rem 0;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.breadcrumb a {
    color: white;
    text-decoration: none;
    opacity: 1;
    transition: opacity 0.3s;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    font-weight: 500;
}

.breadcrumb a:hover {
    opacity: 0.8;
    text-decoration: underline;
}

.breadcrumb i {
    font-size: 0.7rem;
    opacity: 0.9;
}

.breadcrumb > span {
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    font-weight: 600;
}

.chapter-title {
    font-size: 2rem;
    margin: 0 0 1rem 0;
    font-weight: 700;
}

.chapter-info {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Navigation Bar */
.navigation-bar {
    background: white;
    border-bottom: 2px solid #ecf0f1;
    padding: 1rem 0;
    z-index: 100;
}

.navigation-bar.sticky {
    position: sticky;
    top: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.nav-btn {
    background: white;
    border: 2px solid #c9a9a6;
    color: #c9a9a6;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    white-space: nowrap;
}

.nav-btn:hover:not(:disabled) {
    background: #c9a9a6;
    color: white;
}

.nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.chapter-selector {
    position: relative;
    flex: 1;
    max-width: 400px;
}


.chapter-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1000;
}

.dropdown-header {
    padding: 1rem;
    border-bottom: 2px solid #ecf0f1;
}

.chapter-search {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #dfe6e9;
    border-radius: 6px;
    font-size: 0.9rem;
}

.chapter-search:focus {
    outline: none;
    border-color: #c9a9a6;
}

.dropdown-list {
    overflow-y: auto;
    max-height: 320px;
}

.chapter-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #2c3e50;
    transition: background 0.2s;
    border-bottom: 1px solid #f8f9fa;
}

.chapter-item:hover {
    background: #f8f9fa;
}

.chapter-item.active {
    background: #c9a9a6;
    color: white;
}

.chapter-number {
    font-weight: 700;
    min-width: 50px;
}

.chapter-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Reading Settings */
.reading-settings {
    max-width: 1200px;
    margin: 1.5rem auto;
    padding: 0 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.setting-btn {
    width: 40px;
    height: 40px;
    background: white;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    color: #7f8c8d;
}

.setting-btn:hover {
    border-color: #c9a9a6;
    color: #c9a9a6;
}

.setting-btn i + i {
    font-size: 0.7rem;
    margin-left: -0.3rem;
}

/* Chapter Content */
.chapter-content {
    max-width: 1200px;
    margin: 0 auto 3rem;
    padding: 3rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.chapter-content.dark-mode {
    background: #2c3e50;
    color: #ecf0f1;
}

.content-body {
    line-height: 2;
    text-align: justify;
}

.content-body :deep(p) {
    margin-bottom: 1.5rem;
    text-indent: 2rem;
}

/* Bottom Navigation */
.bottom-navigation {
    max-width: 1200px;
    margin: 0 auto 3rem;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

/* Chapter buttons now use global button styles in src/assets/buttons.css */

/* Responsive */
@media (max-width: 768px) {
    .chapter-title {
        font-size: 1.5rem;
    }

    .nav-content {
        flex-wrap: wrap;
    }

    .btn-text {
        display: none;
    }

    .nav-btn {
        padding: 0.75rem;
    }

    .chapter-selector {
        width: 100%;
        max-width: none;
        order: 3;
    }

    .reading-settings {
        justify-content: center;
    }

    .bottom-navigation {
        flex-direction: column;
    }
}
</style>