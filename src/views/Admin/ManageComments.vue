<template>
    <div class="manage-comments">
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-comments"></i>
                    Quản lý Comments
                </h1>
                <p>Quản lý tất cả bình luận trong hệ thống</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
            <div class="filter-group">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm kiếm theo nội dung..."
                        @input="applyFilters"
                    />
                </div>

                <select v-model="filterNovel" @change="applyFilters" class="filter-select">
                    <option value="">Tất cả truyện</option>
                    <option v-for="novel in novels" :key="novel._id" :value="novel._id">
                        {{ novel.title }}
                    </option>
                </select>

                <select v-model="sortBy" @change="applyFilters" class="filter-select">
                    <option value="createdAt">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>

                <button @click="resetFilters" class="btn-reset">
                    <i class="fas fa-redo"></i>
                    Reset
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-comments"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ totalComments }}</h3>
                    <p>Tổng Comments</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ todayComments }}</h3>
                    <p>Hôm Nay</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ uniqueUsers }}</h3>
                    <p>Người Dùng</p>
                </div>
            </div>
        </div>

        <!-- Comments Table -->
        <div class="table-container">
            <div class="table-header">
                <h2>Danh sách Comments ({{ filteredComments.length }})</h2>
            </div>

            <LoadingSpinner v-if="loading" />

            <EmptyState
                v-else-if="paginatedComments.length === 0"
                icon="fa-comment-slash"
                title="Không tìm thấy comment nào"
            />

            <div v-else class="comments-list">
                <div
                    v-for="comment in paginatedComments"
                    :key="comment._id"
                    class="comment-card"
                >
                    <div class="comment-header">
                        <div class="user-info">
                            <img :src="getUserAvatar(comment.userId)" alt="Avatar" class="user-avatar" />
                            <div class="user-details">
                                <strong>{{ getUserName(comment.userId) }}</strong>
                                <span class="comment-time">
                                    <i class="fas fa-clock"></i>
                                    {{ formatDateTime(comment.createdAt) }}
                                </span>
                            </div>
                        </div>
                        <div class="comment-actions">
                            <button @click="viewNovel(comment.novelId)" class="btn-view-novel" title="Xem truyện">
                                <i class="fas fa-book"></i>
                                {{ getNovelTitle(comment.novelId) }}
                            </button>
                            <button @click="confirmDelete(comment)" class="btn-delete" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="comment-content">
                        <p>{{ comment.content }}</p>
                    </div>
                    <div class="comment-footer">
                        <span class="comment-chapter">
                            <i class="fas fa-bookmark"></i>
                            Chương {{ getChapterNumber(comment.chapterId) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-exclamation-triangle"></i>
                        Xác nhận xóa
                    </h3>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa comment này?</p>
                    <div class="comment-preview">
                        <strong>{{ getUserName(commentToDelete?.userId) }}</strong>
                        <p>{{ commentToDelete?.content }}</p>
                    </div>
                    <p class="warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn-cancel">Hủy</button>
                    <button @click="deleteComment" class="btn-confirm-delete">
                        <i class="fas fa-trash"></i>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { CommentService, NovelService, ChapterService } from '@/services';
import UserService from '@/services/user.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';

export default {
    name: 'ManageComments',
    components: { LoadingSpinner, EmptyState },
    data() {
        return {
            comments: [],
            novels: [],
            chapters: [],
            users: [],
            filteredComments: [],
            loading: false,
            searchQuery: '',
            filterNovel: '',
            sortBy: 'createdAt',
            currentPage: 1,
            itemsPerPage: 10,
            showDeleteModal: false,
            commentToDelete: null
        };
    },
    computed: {
        totalComments() {
            return this.comments.length;
        },
        todayComments() {
            const today = new Date().toDateString();
            return this.comments.filter(c => new Date(c.createdAt).toDateString() === today).length;
        },
        uniqueUsers() {
            const userIds = new Set(this.comments.map(c => c.userId));
            return userIds.size;
        },
        paginatedComments() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredComments.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredComments.length / this.itemsPerPage);
        }
    },
    async mounted() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            this.loading = true;
            try {
                // Fetch all data
                this.novels = await NovelService.getAll();
                this.users = await UserService.getAll();
                
                // Fetch all chapters
                const allChapters = [];
                for (const novel of this.novels) {
                    const chapters = await ChapterService.getByNovelId(novel._id);
                    allChapters.push(...chapters);
                }
                this.chapters = allChapters;

                // Fetch all comments
                const allComments = [];
                for (const novel of this.novels) {
                    const comments = await CommentService.getByNovelId(novel._id);
                    allComments.push(...comments);
                }
                
                this.comments = allComments;
                this.applyFilters();
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Không thể tải dữ liệu comments');
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let filtered = [...this.comments];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(comment =>
                    comment.content?.toLowerCase().includes(query)
                );
            }

            // Novel filter
            if (this.filterNovel) {
                filtered = filtered.filter(comment => comment.novelId === this.filterNovel);
            }

            // Sort
            filtered.sort((a, b) => {
                if (this.sortBy === 'createdAt') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                } else if (this.sortBy === 'oldest') {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                return 0;
            });

            this.filteredComments = filtered;
            this.currentPage = 1;
        },
        resetFilters() {
            this.searchQuery = '';
            this.filterNovel = '';
            this.sortBy = 'createdAt';
            this.applyFilters();
        },
        getUserName(userId) {
            const user = this.users.find(u => u._id === userId);
            return user?.username || 'Unknown User';
        },
        getUserAvatar(userId) {
            const user = this.users.find(u => u._id === userId);
            if (!user?.avatar) return '/assets/default-avatar.svg';
            if (user.avatar.startsWith('http')) return user.avatar;
            return `/assets/user/${userId}/${user.avatar}`;
        },
        getNovelTitle(novelId) {
            const novel = this.novels.find(n => n._id === novelId);
            return novel?.title || 'Unknown';
        },
        getChapterNumber(chapterId) {
            const chapter = this.chapters.find(c => c._id === chapterId);
            return chapter?.chapterNumber || '?';
        },
        viewNovel(novelId) {
            this.$router.push(`/novels/${novelId}`);
        },
        confirmDelete(comment) {
            this.commentToDelete = comment;
            this.showDeleteModal = true;
        },
        closeDeleteModal() {
            this.showDeleteModal = false;
            this.commentToDelete = null;
        },
        async deleteComment() {
            if (!this.commentToDelete) return;

            try {
                await CommentService.delete(this.commentToDelete._id);
                
                this.comments = this.comments.filter(c => c._id !== this.commentToDelete._id);
                this.applyFilters();
                
                this.closeDeleteModal();
                alert('Đã xóa comment thành công!');
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('Không thể xóa comment');
            }
        },
        formatDateTime(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN');
        }
    }
};
</script>

<style scoped>
.manage-comments {
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
    color: white;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
}

.header-content p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 1.1rem;
}

/* Filters Section */
.filters-section {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
}

.search-box input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #f093fb;
    box-shadow: 0 0 0 4px rgba(240, 147, 251, 0.1);
}

.filter-select {
    padding: 0.875rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
}

.filter-select:focus {
    outline: none;
    border-color: #f093fb;
}

.btn-reset {
    padding: 0.875rem 1.5rem;
    background: #e9ecef;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-reset:hover {
    background: #dee2e6;
}

/* Stats Cards */
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.purple { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-info h3 {
    margin: 0;
    font-size: 2rem;
    color: #2c3e50;
}

.stat-info p {
    margin: 0.25rem 0 0 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

/* Table Container */
.table-container {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
    margin-bottom: 1.5rem;
}

.table-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
}

/* Comments List */
.comments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comment-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s;
}

.comment-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-details strong {
    color: #2c3e50;
    font-size: 1rem;
}

.comment-time {
    font-size: 0.85rem;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.comment-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-view-novel {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
}

.btn-view-novel:hover {
    background: #2980b9;
}

.btn-delete {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-delete:hover {
    background: #c0392b;
}

.comment-content {
    margin-bottom: 1rem;
}

.comment-content p {
    margin: 0;
    color: #495057;
    line-height: 1.6;
}

.comment-footer {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.comment-chapter {
    background: white;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-page {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
    border-color: #f093fb;
    color: #f093fb;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-weight: 600;
    color: #2c3e50;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #e74c3c;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-body p {
    margin: 0 0 1rem 0;
    color: #495057;
}

.comment-preview {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
}

.comment-preview strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.comment-preview p {
    margin: 0;
    color: #495057;
    font-style: italic;
}

.warning {
    color: #e74c3c;
    font-weight: 600;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn-cancel,
.btn-confirm-delete {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-cancel {
    background: #e9ecef;
    color: #495057;
}

.btn-cancel:hover {
    background: #dee2e6;
}

.btn-confirm-delete {
    background: #e74c3c;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-confirm-delete:hover {
    background: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
    .manage-comments {
        padding: 1rem;
    }

    .filter-group {
        flex-direction: column;
    }

    .search-box {
        min-width: 100%;
    }

    .comment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .comment-actions {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
