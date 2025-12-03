<template>
    <div class="reading-history-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-history"></i>
                    Lịch sử đọc truyện
                </h1>
                <p class="subtitle">
                    Những truyện bạn đã đọc gần đây
                </p>
            </div>
        </div>

        <!-- Stats & Actions Bar -->
        <div class="stats-actions-bar">
            <div class="stats-section">
                <div class="stat-item">
                    <i class="fas fa-book-reader"></i>
                    <div class="stat-content">
                        <span class="stat-value">{{ historyList.length }}</span>
                        <span class="stat-label">Truyện đã đọc</span>
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-clock"></i>
                    <div class="stat-content">
                        <span class="stat-value">{{ todayCount }}</span>
                        <span class="stat-label">Đọc hôm nay</span>
                    </div>
                </div>
            </div>

            <div class="actions-section">
                <button 
                    v-if="historyList.length > 0" 
                    @click="confirmClearAll" 
                    class="btn-clear-all"
                >
                    <i class="fas fa-trash-alt"></i>
                    Xóa tất cả
                </button>
            </div>
        </div>

        <!-- Filters & Sort -->
        <div v-if="historyList.length > 0" class="filters-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Tìm kiếm theo tên truyện..."
                    @input="applyFilters"
                />
            </div>

            <select v-model="sortBy" @change="applySorting" class="filter-select">
                <option value="recent">Đọc gần nhất</option>
                <option value="oldest">Đọc lâu nhất</option>
                <option value="title">Tên A-Z</option>
            </select>

            <button @click="clearFilters" class="btn-clear" title="Xóa bộ lọc">
                <i class="fas fa-redo"></i>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải lịch sử đọc...</p>
        </div>

        <!-- Empty State - Not Logged In -->
        <div v-else-if="!isAuthenticated" class="empty-state">
            <i class="fas fa-user-lock"></i>
            <h3>Bạn chưa đăng nhập</h3>
            <p>Vui lòng đăng nhập để xem lịch sử đọc truyện</p>
            <router-link to="/login" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                Đăng nhập ngay
            </router-link>
        </div>

        <!-- Empty State - No History -->
        <div v-else-if="historyList.length === 0 && !loading" class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>Chưa có lịch sử đọc</h3>
            <p>Bạn chưa đọc truyện nào. Hãy bắt đầu khám phá!</p>
            <router-link to="/" class="btn-browse">
                <i class="fas fa-compass"></i>
                Khám phá ngay
            </router-link>
        </div>

        <!-- History List -->
        <div v-else-if="filteredHistory.length > 0" class="history-container">
            <div class="history-list">
                <div 
                    v-for="item in paginatedHistory" 
                    :key="item._id || item.novelId" 
                    class="history-item"
                >
                    <!-- Cover Image -->
                    <div class="history-cover">
                        <img
                            :src="item.novelCover || '/assets/default-book.png'"
                            :alt="item.novelTitle"
                            @error="handleImageError"
                        />
                        <div class="time-badge">
                            <i class="fas fa-clock"></i>
                            {{ formatTime(item.lastRead) }}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="history-info">
                        <a 
                            :href="`/novels/${item.novelId}`"
                            class="novel-title"
                            @click.prevent="goToNovel(item.novelId)"
                        >
                            {{ item.novelTitle || 'Không rõ tên' }}
                        </a>
                        
                        <div class="chapter-info">
                            <i class="fas fa-bookmark"></i>
                            <span>Đang đọc: {{ item.chapterTitle || `Chương ${item.chapterNumber || '?'}` }}</span>
                        </div>

                        <div class="read-time">
                            <i class="far fa-calendar-alt"></i>
                            Lần cuối đọc: {{ formatDate(item.lastRead) }}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="history-actions">
                        <a
                            :href="`/novels/${item.novelId}/chapters/${item.chapterId}`"
                            class="btn-action btn-continue"
                            @click.prevent="continueReading(item)"
                        >
                            <i class="fas fa-play"></i>
                            Đọc tiếp
                        </a>
                        <a
                            :href="`/novels/${item.novelId}`"
                            class="btn-action btn-view"
                            @click.prevent="goToNovel(item.novelId)"
                        >
                            <i class="fas fa-info-circle"></i>
                            Chi tiết
                        </a>
                        <button
                            @click="confirmRemove(item)"
                            class="btn-action btn-remove"
                            title="Xóa khỏi lịch sử"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="pagination-btn"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>

                <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="['pagination-btn', { active: page === currentPage }]"
                >
                    {{ page }}
                </button>

                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="pagination-btn"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>

                <span class="pagination-info">
                    Trang {{ currentPage }} / {{ totalPages }}
                </span>
            </div>
        </div>

        <!-- No Results After Filter -->
        <div v-else class="empty-state">
            <i class="fas fa-search-minus"></i>
            <h3>Không tìm thấy kết quả</h3>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
            <button @click="clearFilters" class="btn-browse">
                <i class="fas fa-redo"></i>
                Xóa bộ lọc
            </button>
        </div>

        <!-- Confirm Delete Modal -->
        <DeleteModal
            :show="showDeleteModal"
            :title="deleteAll ? 'Xóa toàn bộ lịch sử?' : 'Xóa khỏi lịch sử?'"
            :message="deleteAll ? 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc truyện?' : 'Bạn có chắc muốn xóa truyện này khỏi lịch sử?'"
            :item-name="deleteAll ? '' : itemToDelete?.novelTitle"
            :loading="deleting"
            @confirm="deleteAll ? handleClearAll() : handleRemove()"
            @cancel="closeDeleteModal"
        />
    </div>
</template>

<script>
import { ReadingHistoryService } from '@/services';
import { useAuthStore } from '@/stores';
import DeleteModal from '@/components/Common/DeleteModal.vue';

export default {
    name: 'ReadingHistoryPage',
    components: { DeleteModal },
    data() {
        return {
            historyList: [],
            filteredHistory: [],
            loading: false,
            searchQuery: '',
            sortBy: 'recent',
            currentPage: 1,
            itemsPerPage: 10,
            authStore: useAuthStore(),
            showDeleteModal: false,
            itemToDelete: null,
            deleteAll: false,
            deleting: false
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        userId() {
            return this.authStore.user?._id;
        },
        todayCount() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return this.historyList.filter(item => {
                const lastRead = new Date(item.lastRead);
                return lastRead >= today;
            }).length;
        },
        paginatedHistory() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredHistory.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredHistory.length / this.itemsPerPage);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    async mounted() {
        if (this.isAuthenticated && this.userId) {
            await this.loadHistory();
        }
    },
    methods: {
        async loadHistory() {
            this.loading = true;
            try {
                const response = await ReadingHistoryService.getUserHistory(this.userId);
                this.historyList = response.data || response || [];
                this.applyFilters();
            } catch (error) {
                console.error('Error loading reading history:', error);
                this.historyList = [];
                
                // Fallback to localStorage if API fails
                this.loadFromLocalStorage();
            } finally {
                this.loading = false;
            }
        },
        loadFromLocalStorage() {
            const stored = localStorage.getItem('reading_history');
            if (stored) {
                try {
                    this.historyList = JSON.parse(stored);
                    this.applyFilters();
                } catch (error) {
                    console.error('Error parsing localStorage:', error);
                    this.historyList = [];
                }
            }
        },
        applyFilters() {
            let result = [...this.historyList];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(item =>
                    item.novelTitle?.toLowerCase().includes(query) ||
                    item.chapterTitle?.toLowerCase().includes(query)
                );
            }

            this.filteredHistory = result;
            this.applySorting();
            this.currentPage = 1;
        },
        applySorting() {
            const sortFunctions = {
                'recent': (a, b) => new Date(b.lastRead) - new Date(a.lastRead),
                'oldest': (a, b) => new Date(a.lastRead) - new Date(b.lastRead),
                'title': (a, b) => (a.novelTitle || '').localeCompare(b.novelTitle || '')
            };

            this.filteredHistory.sort(sortFunctions[this.sortBy] || sortFunctions['recent']);
        },
        clearFilters() {
            this.searchQuery = '';
            this.sortBy = 'recent';
            this.applyFilters();
        },
        confirmRemove(item) {
            this.itemToDelete = item;
            this.deleteAll = false;
            this.showDeleteModal = true;
        },
        confirmClearAll() {
            this.deleteAll = true;
            this.showDeleteModal = true;
        },
        closeDeleteModal() {
            this.showDeleteModal = false;
            this.itemToDelete = null;
            this.deleteAll = false;
        },
        async handleRemove() {
            if (!this.itemToDelete) return;

            this.deleting = true;
            try {
                await ReadingHistoryService.removeFromHistory(this.userId, this.itemToDelete.novelId);
                
                // Remove from local list
                this.historyList = this.historyList.filter(
                    item => item.novelId !== this.itemToDelete.novelId
                );
                this.applyFilters();
                
                this.closeDeleteModal();
            } catch (error) {
                console.error('Error removing from history:', error);
                alert('Không thể xóa. Vui lòng thử lại!');
            } finally {
                this.deleting = false;
            }
        },
        async handleClearAll() {
            this.deleting = true;
            try {
                await ReadingHistoryService.clearHistory(this.userId);
                
                this.historyList = [];
                this.filteredHistory = [];
                
                this.closeDeleteModal();
            } catch (error) {
                console.error('Error clearing history:', error);
                alert('Không thể xóa. Vui lòng thử lại!');
            } finally {
                this.deleting = false;
            }
        },
        continueReading(item) {
            this.$router.push(`/novels/${item.novelId}/chapters/${item.chapterId}`);
        },
        goToNovel(novelId) {
            this.$router.push(`/novels/${novelId}`);
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        formatTime(dateString) {
            const date = new Date(dateString);
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
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        handleImageError(event) {
            event.target.src = '/assets/default-book.png';
        }
    }
};
</script>

<style scoped>
.reading-history-page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
    padding: 2rem 0;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 0;
    margin-bottom: 2rem;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.subtitle {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Stats & Actions Bar */
.stats-actions-bar {
    max-width: 1200px;
    margin: -1.5rem auto 2rem;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
}

.stats-section {
    display: flex;
    gap: 1.5rem;
    flex: 1;
}

.stat-item {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    transition: all 0.3s;
}

.stat-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-item > i {
    font-size: 2.5rem;
    color: #667eea;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
}

.stat-label {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-top: 0.25rem;
}

.actions-section {
    display: flex;
    gap: 1rem;
}

.btn-clear-all {
    background: white;
    border: 2px solid #e74c3c;
    color: #e74c3c;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.btn-clear-all:hover {
    background: #e74c3c;
    color: white;
}

/* Filters Section */
.filters-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 2rem;
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
    color: #95a5a6;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
}

.filter-select:focus {
    outline: none;
    border-color: #667eea;
}

.btn-clear {
    background: white;
    border: 2px solid #dfe6e9;
    color: #7f8c8d;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
}

.btn-clear:hover {
    background: #f8f9fa;
    border-color: #667eea;
    color: #667eea;
}

/* Loading */
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state i {
    font-size: 5rem;
    color: #667eea;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.75rem;
}

.empty-state p {
    color: #7f8c8d;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.btn-login,
.btn-browse {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
}

.btn-login:hover,
.btn-browse:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* History Container */
.history-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

/* History List */
.history-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.history-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1.5rem;
    transition: all 0.3s;
}

.history-item:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
}

.history-cover {
    position: relative;
    flex-shrink: 0;
}

.history-cover img {
    width: 120px;
    height: 170px;
    object-fit: cover;
    border-radius: 8px;
}

.time-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
}

.history-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.novel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2c3e50;
    text-decoration: none;
    transition: color 0.3s;
}

.novel-title:hover {
    color: #667eea;
}

.chapter-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #667eea;
    font-weight: 600;
}

.chapter-info i {
    color: #f39c12;
}

.read-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #95a5a6;
    font-size: 0.9rem;
}

.history-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: center;
    min-width: 140px;
}

.btn-action {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    white-space: nowrap;
    text-decoration: none;
    font-size: 0.9rem;
}

.btn-continue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-continue:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-view {
    background: white;
    border: 2px solid #667eea;
    color: #667eea;
}

.btn-view:hover {
    background: #667eea;
    color: white;
}

.btn-remove {
    background: white;
    border: 2px solid #e74c3c;
    color: #e74c3c;
}

.btn-remove:hover {
    background: #e74c3c;
    color: white;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 3rem;
    padding: 1.5rem;
}

.pagination-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 0.75rem;
    border: 2px solid #dfe6e9;
    background: white;
    color: #2c3e50;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #667eea;
    background: #667eea;
    color: white;
}

.pagination-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    margin-left: 1rem;
    color: #7f8c8d;
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-actions-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .stats-section {
        width: 100%;
    }

    .actions-section {
        justify-content: flex-end;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 2rem;
    }

    .stats-section {
        flex-direction: column;
    }

    .filters-section {
        flex-direction: column;
    }

    .history-item {
        flex-direction: column;
    }

    .history-cover img {
        width: 100%;
        height: 250px;
    }

    .history-actions {
        flex-direction: row;
        min-width: auto;
    }

    .btn-action {
        flex: 1;
    }
}
</style>
