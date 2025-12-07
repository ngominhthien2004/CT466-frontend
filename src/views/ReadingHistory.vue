<template>
    <div class="reading-history-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-history"></i>
                    Lịch sử đọc
                </h1>
                <p class="subtitle">
                    Những tiểu thuyết bạn đã đọc gần đây
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
                        <span class="stat-label">Tiểu thuyết đã đọc</span>
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
                    placeholder="Tìm kiếm theo tên tiểu thuyết..."
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
            <p>Vui lòng đăng nhập để xem lịch sử đọc</p>
            <router-link to="/login" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                Đăng nhập ngay
            </router-link>
        </div>

        <!-- Empty State - No History -->
        <div v-else-if="historyList.length === 0 && !loading" class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>Chưa có lịch sử đọc</h3>
            <p>Bạn chưa đọc tiểu thuyết nào. Hãy bắt đầu khám phá!</p>
            <router-link to="/" class="btn-browse">
                <i class="fas fa-compass"></i>
                Khám phá ngay
            </router-link>
        </div>

        <!-- History List -->
        <div v-else-if="filteredHistory.length > 0" class="history-container">
            <div class="history-grid">
                <div 
                    v-for="item in paginatedHistory" 
                    :key="item._id || item.novelId" 
                    class="history-card"
                    @click="continueReading(item)"
                >
                    <!-- Cover Image -->
                    <div class="card-cover">
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
                    <div class="card-info">
                        <h3 class="card-title">
                            {{ item.novelTitle || 'Không rõ tên' }}
                        </h3>
                        
                        <div class="card-chapter">
                            <i class="fas fa-bookmark"></i>
                            <span>{{ item.chapterTitle || `Chương ${item.chapterNumber || '?'}` }}</span>
                        </div>

                        <div class="card-date">
                            <i class="far fa-calendar-alt"></i>
                            {{ formatDate(item.lastRead) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <Pagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredHistory.length"
                @change="goToPage"
            />
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
            :message="deleteAll ? 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc?' : 'Bạn có chắc muốn xóa tiểu thuyết này khỏi lịch sử?'"
            :item-name="deleteAll ? '' : itemToDelete?.novelTitle"
            :loading="deleting"
            @confirm="deleteAll ? handleClearAll() : handleRemove()"
            @cancel="closeDeleteModal"
        />
        
        <!-- Notification Modal -->
        <NotificationModal
            :show="showNotification"
            :type="notificationType"
            :message="notificationMessage"
            @close="() => { showNotification = false; notificationMessage = ''; notificationType = 'info' }"
        />
    </div>
</template>

<script>
import { ReadingHistoryService } from '@/services';
import { useAuthStore } from '@/stores';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import Pagination from '@/components/Common/Pagination.vue';

export default {
    name: 'ReadingHistoryPage',
    components: { DeleteModal, NotificationModal, Pagination },
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
            deleting: false,
            // notification state
            showNotification: false,
            notificationMessage: '',
            notificationType: 'info'
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
                    this.showNotification = true;
                    this.notificationType = 'error';
                    this.notificationMessage = 'Không thể xóa. Vui lòng thử lại!';
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
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể xóa. Vui lòng thử lại!';
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

/* Filters Section */
.filters-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

/* History Container */
.history-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

/* History List */
.history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

.history-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
}

.history-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
}

.card-cover {
    position: relative;
    flex-shrink: 0;
    width: 100%;
    padding-top: 140%;
    overflow: hidden;
    background: #f0f0f0;
}

.card-cover img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.time-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    font-weight: 600;
}

.card-info {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.card-title {
    font-size: 1rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
}

.card-chapter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #667eea;
    font-weight: 600;
    font-size: 0.9rem;
}

.card-chapter i {
    color: #f39c12;
    font-size: 0.85rem;
}

.card-chapter span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #95a5a6;
    font-size: 0.8rem;
    margin-top: auto;
}

.card-date i {
    font-size: 0.75rem;
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

    .history-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

    .history-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .card-cover {
        padding-top: 145%;
    }

    .card-info {
        padding: 0.75rem;
    }

    .card-title {
        font-size: 0.9rem;
    }

    .card-chapter {
        font-size: 0.85rem;
    }

    .card-date {
        font-size: 0.75rem;
    }
}
</style>
