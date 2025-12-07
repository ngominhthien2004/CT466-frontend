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
                    Danh sách các tiểu thuyết yêu thích
                </p>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
            <div class="stat-item">
                <i class="fas fa-book"></i>
                <div class="stat-content">
                    <span class="stat-value">{{ favoriteNovels.length }}</span>
                    <span class="stat-label">Yêu thích</span>
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
            <h3>Chưa có tiểu thuyết yêu thích</h3>
            <p>Bạn chưa thêm tiểu thuyết nào vào danh sách yêu thích</p>
            <router-link to="/" class="btn-browse">
                <i class="fas fa-book-open"></i>
                Khám phá ngay
            </router-link>
        </div>

        <!-- Novels Grid -->
        <div v-else-if="filteredNovels.length > 0" class="novels-container">
            <div class="novels-grid">
                <NovelCard
                    v-for="novel in paginatedNovels"
                    :key="novel._id"
                    :novel="novel"
                    :is-favorite="isNovelFavorited(novel)"
                    @toggle-favorite="handleToggleFavorite"
                />
            </div>

            <!-- Pagination -->
            <Pagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredNovels.length"
                @change="goToPage"
            />
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
import { NovelService } from '@/services';
import { useAuthStore, useNovelStore } from '@/stores';
import NovelCard from '@/components/Novel/NovelCard.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import Pagination from '@/components/Common/Pagination.vue';

export default {
    name: 'FavoritePage',
    components: {
        NovelCard,
        NotificationModal,
        Pagination
    },
    data() {
        return {
            favoriteNovels: [],
            filteredNovels: [],
            loading: false,
            searchQuery: '',
            filterStatus: '',
            sortBy: 'addedDate',
            currentPage: 1,
            itemsPerPage: 12,
            authStore: useAuthStore(),
            novelStore: useNovelStore(),
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
        paginatedNovels() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredNovels.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredNovels.length / this.itemsPerPage);
        }
    },
    async mounted() {
        if (this.isAuthenticated) {
            await this.loadFavorites();
        }
    },
    methods: {
        isNovelFavorited(novel) {
            // In Favorite page, all novels are favorited by definition
            // But check properly in case of race conditions
            const userId = this.authStore.user?._id;
            if (!userId || !novel) return true; // Default to true in favorite page
            return novel.favoritedBy?.includes(userId) ?? true;
        },
        async loadFavorites() {
            this.loading = true;
            try {
                const userId = this.authStore.user?._id;
                if (!userId) {
                    this.favoriteNovels = [];
                    return;
                }
                
                // Get novels favorited by current user
                const response = await NovelService.getFavoritesByUserId(userId);
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
                    this.showNotification = true;
                    this.notificationType = 'warning';
                    this.notificationMessage = 'Vui lòng đăng nhập';
                    return;
                }
                
                // Use store to toggle favorite - this will update all pages
                await this.novelStore.toggleFavoriteWithApi(novel._id, userId);
                
                // Remove from local list
                this.favoriteNovels = this.favoriteNovels.filter(n => n._id !== novel._id);
                this.applyFilters();
            } catch (error) {
                console.error('Error removing from favorites:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể bỏ yêu thích. Vui lòng thử lại!';
            }
        },
        handleToggleFavorite(novelId) {
            // Find the novel object by id
            const novel = this.favoriteNovels.find(n => n._id === novelId);
            if (novel) {
                this.toggleFavorite(novel);
            }
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

/* Grid View */
.novels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
}

/* Pagination handled by shared Pagination.vue component styles */

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

}
</style>
