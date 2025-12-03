<template>
    <div class="favorite-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-heart"></i>
                    Tiểu thuyết yêu thích
                </h1>
                <p class="subtitle">
                    Danh sách các truyện bạn đã yêu thích
                </p>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
            <div class="stat-item">
                <i class="fas fa-book"></i>
                <div class="stat-content">
                    <span class="stat-value">{{ favoriteNovels.length }}</span>
                    <span class="stat-label">Truyện yêu thích</span>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-eye"></i>
                <div class="stat-content">
                    <span class="stat-value">{{ formatNumber(totalViews) }}</span>
                    <span class="stat-label">Tổng lượt xem</span>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-fire"></i>
                <div class="stat-content">
                    <span class="stat-value">{{ completedCount }}</span>
                    <span class="stat-label">Đã hoàn thành</span>
                </div>
            </div>
        </div>

        <!-- Filters & Sort -->
        <div class="filters-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Tìm kiếm theo tên, tác giả..."
                    @input="applyFilters"
                />
            </div>

            <select v-model="filterStatus" @change="applyFilters" class="filter-select">
                <option value="">Tất cả trạng thái</option>
                <option value="ongoing">Đang ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="paused">Tạm dừng</option>
            </select>

            <select v-model="sortBy" @change="applySorting" class="filter-select">
                <option value="addedDate">Mới thêm</option>
                <option value="title">Tên A-Z</option>
                <option value="views">Lượt xem</option>
                <option value="likes">Lượt thích</option>
            </select>

            <button @click="clearAllFilters" class="btn-clear" title="Xóa bộ lọc">
                <i class="fas fa-redo"></i>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải danh sách yêu thích...</p>
        </div>

        <!-- Empty State - Not Logged In -->
        <div v-else-if="!isAuthenticated" class="empty-state">
            <i class="fas fa-user-lock"></i>
            <h3>Bạn chưa đăng nhập</h3>
            <p>Vui lòng đăng nhập để xem danh sách yêu thích</p>
            <router-link to="/login" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                Đăng nhập ngay
            </router-link>
        </div>

        <!-- Empty State - No Favorites -->
        <div v-else-if="favoriteNovels.length === 0 && !loading" class="empty-state">
            <i class="fas fa-heart-broken"></i>
            <h3>Chưa có truyện yêu thích</h3>
            <p>Bạn chưa thêm truyện nào vào danh sách yêu thích</p>
            <router-link to="/" class="btn-browse">
                <i class="fas fa-book-open"></i>
                Khám phá ngay
            </router-link>
        </div>

        <!-- Novels Grid -->
        <div v-else-if="filteredNovels.length > 0" class="novels-container">
            <div class="view-toggle">
                <button 
                    @click="viewMode = 'grid'" 
                    :class="['toggle-btn', { active: viewMode === 'grid' }]"
                    title="Xem dạng lưới"
                >
                    <i class="fas fa-th"></i>
                </button>
                <button 
                    @click="viewMode = 'list'" 
                    :class="['toggle-btn', { active: viewMode === 'list' }]"
                    title="Xem dạng danh sách"
                >
                    <i class="fas fa-list"></i>
                </button>
            </div>

            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="novels-grid">
                <NovelCard
                    v-for="novel in paginatedNovels"
                    :key="novel._id"
                    :novel="novel"
                    @toggle-favorite="handleToggleFavorite"
                />
            </div>

            <!-- List View -->
            <div v-else class="novels-list">
                <div v-for="novel in paginatedNovels" :key="novel._id" class="novel-list-item">
                    <img
                        :src="novel.coverImage || '/assets/default-book.png'"
                        :alt="novel.title"
                        class="list-cover"
                    />
                    <div class="list-info">
                        <div class="list-header">
                            <router-link :to="`/novels/${novel._id}`" class="list-title">
                                {{ novel.title }}
                            </router-link>
                            <span class="status-badge" :class="novel.status">
                                {{ getStatusText(novel.status) }}
                            </span>
                        </div>
                        <p class="list-author">
                            <i class="fas fa-user"></i>
                            {{ novel.author || 'Chưa rõ' }}
                        </p>
                        <div class="list-genres">
                            <span v-for="genre in novel.genres?.slice(0, 5)" :key="genre" class="genre-tag">
                                {{ genre }}
                            </span>
                        </div>
                        <p class="list-description">
                            {{ truncateText(novel.description, 150) }}
                        </p>
                        <div class="list-stats">
                            <span><i class="fas fa-eye"></i> {{ formatNumber(novel.views || 0) }} lượt xem</span>
                            <span><i class="fas fa-heart"></i> {{ formatNumber(novel.likes || 0) }} lượt thích</span>
                            <span><i class="fas fa-book"></i> {{ novel.chapterCount || 0 }} chương</span>
                        </div>
                    </div>
                    <div class="list-actions">
                        <router-link :to="`/novels/${novel._id}`" class="btn-action btn-read">
                            <i class="fas fa-book-open"></i>
                            Đọc truyện
                        </router-link>
                        <button @click="toggleFavorite(novel)" class="btn-action btn-unfavorite">
                            <i class="fas fa-heart-broken"></i>
                            Bỏ yêu thích
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
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button @click="clearAllFilters" class="btn-browse">
                <i class="fas fa-redo"></i>
                Xóa bộ lọc
            </button>
        </div>
    </div>
</template>

<script>
import { NovelService } from '@/services';
import { useAuthStore, useNovelStore } from '@/stores';
import NovelCard from '@/components/Novel/NovelCard.vue';

export default {
    name: 'FavoritePage',
    components: {
        NovelCard
    },
    data() {
        return {
            favoriteNovels: [],
            filteredNovels: [],
            loading: false,
            searchQuery: '',
            filterStatus: '',
            sortBy: 'addedDate',
            viewMode: 'grid', // 'grid' or 'list'
            currentPage: 1,
            itemsPerPage: 12,
            authStore: useAuthStore(),
            novelStore: useNovelStore()
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        totalViews() {
            return this.favoriteNovels.reduce((sum, novel) => sum + (novel.views || 0), 0);
        },
        completedCount() {
            return this.favoriteNovels.filter(novel => novel.status === 'completed').length;
        },
        paginatedNovels() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredNovels.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredNovels.length / this.itemsPerPage);
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
        if (this.isAuthenticated) {
            await this.loadFavorites();
        }
    },
    methods: {
        async loadFavorites() {
            this.loading = true;
            try {
                const response = await NovelService.getFavorites();
                this.favoriteNovels = response.data || response || [];
                this.applyFilters();
            } catch (error) {
                console.error('Error loading favorites:', error);
                this.favoriteNovels = [];
                // Nếu lỗi 401 (unauthorized), có thể là chưa đăng nhập
                if (error.response?.status === 401) {
                    this.authStore.logout();
                }
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let result = [...this.favoriteNovels];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query) ||
                    novel.genres?.some(g => g.toLowerCase().includes(query))
                );
            }

            // Status filter
            if (this.filterStatus) {
                result = result.filter(novel => novel.status === this.filterStatus);
            }

            this.filteredNovels = result;
            this.applySorting();
            this.currentPage = 1; // Reset to first page after filtering
        },
        applySorting() {
            const sortFunctions = {
                'addedDate': (a, b) => new Date(b.addedToFavorites || b.createdAt || 0) - new Date(a.addedToFavorites || a.createdAt || 0),
                'title': (a, b) => (a.title || '').localeCompare(b.title || ''),
                'views': (a, b) => (b.views || 0) - (a.views || 0),
                'likes': (a, b) => (b.likes || 0) - (a.likes || 0)
            };

            this.filteredNovels.sort(sortFunctions[this.sortBy] || sortFunctions['addedDate']);
        },
        clearAllFilters() {
            this.searchQuery = '';
            this.filterStatus = '';
            this.sortBy = 'addedDate';
            this.applyFilters();
        },
        async toggleFavorite(novel) {
            // Remove from favorites
            if (!novel || !novel._id) return;
            
            const confirmed = confirm(`Bạn có chắc muốn bỏ yêu thích "${novel.title}"?`);
            if (!confirmed) return;

            try {
                const userId = this.authStore.user?._id;
                if (!userId) {
                    alert('Vui lòng đăng nhập');
                    return;
                }
                
                // Use store to toggle favorite - this will update all pages
                await this.novelStore.toggleFavoriteWithApi(novel._id, userId);
                
                // Remove from local list
                this.favoriteNovels = this.favoriteNovels.filter(n => n._id !== novel._id);
                this.applyFilters();
            } catch (error) {
                console.error('Error removing from favorites:', error);
                alert('Không thể bỏ yêu thích. Vui lòng thử lại!');
            }
        },
        handleToggleFavorite(novel) {
            this.toggleFavorite(novel);
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        getStatusText(status) {
            const statusMap = {
                'ongoing': 'Đang ra',
                'completed': 'Hoàn thành',
                'paused': 'Tạm dừng',
                'dropped': 'Ngưng'
            };
            return statusMap[status] || status;
        },
        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },
        truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
    }
};
</script>

<style scoped>
.favorite-page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
    padding: 2rem 0;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
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

/* Stats Bar */
.stats-bar {
    max-width: 1200px;
    margin: -1.5rem auto 2rem;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s;
}

.stat-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-item > i {
    font-size: 2.5rem;
    color: #c9a9a6;
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
    border-color: #c9a9a6;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
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
    border-color: #c9a9a6;
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
    border-color: #c9a9a6;
    color: #c9a9a6;
}

/* Utility styles moved to utilities.css */

/* Custom empty state styling */
.empty-state {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state i {
    font-size: 5rem;
}

.empty-state h3 {
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
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
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
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.4);
}

/* Novels Container */
.novels-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

/* View Toggle */
.view-toggle {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
}

.toggle-btn {
    width: 45px;
    height: 45px;
    border: 2px solid #dfe6e9;
    background: white;
    color: #7f8c8d;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}

.toggle-btn:hover {
    border-color: #c9a9a6;
    color: #c9a9a6;
}

.toggle-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border-color: #c9a9a6;
}

/* Grid View */
.novels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
}

/* List View */
.novels-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.novel-list-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1.5rem;
    transition: all 0.3s;
}

.novel-list-item:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transform: translateX(5px);
}

.list-cover {
    width: 120px;
    height: 170px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
}

.list-info {
    flex: 1;
}

.list-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.list-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2c3e50;
    text-decoration: none;
}

.list-title:hover {
    color: #c9a9a6;
}

.list-author {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.list-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.list-description {
    color: #7f8c8d;
    line-height: 1.6;
    margin: 0 0 1rem 0;
}

.list-stats {
    display: flex;
    gap: 2rem;
    font-size: 0.9rem;
    color: #95a5a6;
}

.list-stats span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.list-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: center;
}

.btn-action {
    padding: 0.75rem 1.5rem;
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
}

.btn-action.btn-read {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
}

.btn-action.btn-read:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

.btn-action.btn-unfavorite {
    background: white;
    border: 2px solid #e74c3c;
    color: #e74c3c;
}

.btn-action.btn-unfavorite:hover {
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
    border-color: #c9a9a6;
    background: #c9a9a6;
    color: white;
}

.pagination-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border-color: #c9a9a6;
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
    .novels-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 2rem;
    }

    .stats-bar {
        grid-template-columns: 1fr;
    }

    .filters-section {
        flex-direction: column;
    }

    .novels-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .novel-list-item {
        flex-direction: column;
    }

    .list-cover {
        width: 100%;
        height: 250px;
    }

    .list-actions {
        flex-direction: row;
    }
}
</style>
