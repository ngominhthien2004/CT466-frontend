<template>
    <div class="search-page">
        <!-- Search Header -->
        <div class="search-header">
            <div class="container">
                <h1 class="page-title">
                    <i class="fas fa-search"></i>
                    Tìm kiếm tiểu thuyết
                </h1>
                <SearchNovel
                    v-model="searchQuery"
                    placeholder="Tìm kiếm theo tên tiểu thuyết, tác giả..."
                    :show-suggestions-on-type="false"
                    @search="handleSearch"
                    @clear="handleClear"
                />
            </div>
        </div>

        <div class="container">
            <div class="search-content">
                <!-- Sidebar Filters -->
                <aside class="search-sidebar">
                    <div class="filter-section">
                        <h3 class="filter-title">
                            <i class="fas fa-filter"></i>
                            Bộ lọc
                        </h3>

                        <!-- Genre Filter -->
                        <div class="filter-group">
                            <h4 class="filter-label">Thể loại</h4>
                            <div class="genre-list">
                                <label 
                                    v-for="genre in genres" 
                                    :key="genre._id"
                                    class="genre-checkbox"
                                >
                                    <input 
                                        type="checkbox" 
                                        :value="genre._id.toString()"
                                        v-model="selectedGenres"
                                        @change="applyFilters"
                                    />
                                    <span>{{ genre.name }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Status Filter -->
                        <div class="filter-group">
                            <h4 class="filter-label">Trạng thái</h4>
                            <select v-model="statusFilter" @change="applyFilters" class="filter-select">
                                <option value="">Tất cả</option>
                                <option value="ongoing">Đang tiến hành</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="paused">Tạm dừng</option>
                            </select>
                        </div>

                        <!-- Sort Filter -->
                        <div class="filter-group">
                            <h4 class="filter-label">Sắp xếp</h4>
                            <select v-model="sortBy" @change="applyFilters" class="filter-select">
                                <option value="createdAt">Mới nhất</option>
                                <option value="views">Xem nhiều nhất</option>
                                <option value="likes">Yêu thích nhất</option>
                                <option value="title">Tên A-Z</option>
                            </select>
                        </div>

                        <!-- Reset Button -->
                        <button @click="resetFilters" class="btn-reset">
                            <i class="fas fa-redo"></i>
                            Đặt lại bộ lọc
                        </button>
                    </div>
                </aside>

                <!-- Main Results -->
                <main class="search-results">
                    <!-- Results Header -->
                    <div class="results-header">
                        <h2 class="results-title">
                            {{ searchQuery ? `Kết quả cho "${searchQuery}"` : 'Tất cả tiểu thuyết' }}
                        </h2>
                        <span class="results-count">
                            {{ filteredNovels.length }} kết quả
                        </span>
                    </div>

                    <!-- Loading State -->
                    <LoadingSpinner v-if="loading" />

                    <!-- Empty State -->
                    <EmptyState
                        v-else-if="filteredNovels.length === 0"
                        icon="fa-search"
                        title="Không tìm thấy kết quả"
                        message="Thử thay đổi từ khóa hoặc bộ lọc"
                    />

                    <!-- Novel Grid -->
                    <NovelList
                        v-else
                        :novels="paginatedNovels"
                        :loading="false"
                        :show-pagination="false"
                        @toggle-favorite="handleToggleFavorite"
                    />

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="pagination">
                        <button
                            @click="currentPage--"
                            :disabled="currentPage === 1"
                            class="pagination-btn"
                        >
                            <i class="fas fa-chevron-left"></i>
                        </button>

                        <button
                            v-for="page in visiblePages"
                            :key="page"
                            @click="currentPage = page"
                            :class="['pagination-btn', { active: page === currentPage }]"
                        >
                            {{ page }}
                        </button>

                        <button
                            @click="currentPage++"
                            :disabled="currentPage === totalPages"
                            class="pagination-btn"
                        >
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script>
import SearchNovel from '@/components/Novel/SearchNovel.vue';
import NovelList from '@/components/Novel/NovelList.vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import NovelService from '@/services/novel.service';
import GenreService from '@/services/genre.service';
import { useAuthStore } from '@/stores';

export default {
    name: 'SearchPage',
    components: {
        SearchNovel,
        NovelList,
        LoadingSpinner,
        EmptyState
    },
    data() {
        return {
            authStore: useAuthStore(),
            searchQuery: '',
            novels: [],
            filteredNovels: [],
            genres: [],
            selectedGenres: [],
            statusFilter: '',
            sortBy: 'createdAt',
            loading: false,
            currentPage: 1,
            itemsPerPage: 12
        };
    },
    computed: {
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
        await this.loadData();
        
        // Check for query params
        const query = this.$route.query.q;
        if (query) {
            this.searchQuery = query;
            this.handleSearch();
        }
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                const [novelsData, genresData] = await Promise.all([
                    NovelService.getAll(),
                    GenreService.getAll()
                ]);
                this.novels = novelsData;
                this.filteredNovels = novelsData;
                this.genres = genresData;
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                this.loading = false;
            }
        },

        handleSearch() {
            this.applyFilters();
        },

        handleClear() {
            this.searchQuery = '';
            this.applyFilters();
        },

        applyFilters() {
            let result = [...this.novels];

            // Search query filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query) ||
                    novel.description?.toLowerCase().includes(query)
                );
            }

            // Genre filter
            if (this.selectedGenres.length > 0) {
                result = result.filter(novel => {
                    if (!novel.genres || novel.genres.length === 0) return false;
                    
                    // Handle both string IDs and genre objects
                    return novel.genres.some(genre => {
                        const genreId = typeof genre === 'string' ? genre : genre._id?.toString();
                        return this.selectedGenres.includes(genreId);
                    });
                });
            }

            // Status filter
            if (this.statusFilter) {
                result = result.filter(novel => novel.status === this.statusFilter);
            }

            // Sort
            result.sort((a, b) => {
                switch (this.sortBy) {
                    case 'views':
                        return (b.views || 0) - (a.views || 0);
                    case 'likes':
                        return (b.likes || 0) - (a.likes || 0);
                    case 'title':
                        return (a.title || '').localeCompare(b.title || '');
                    case 'createdAt':
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            this.filteredNovels = result;
            this.currentPage = 1;
        },

        resetFilters() {
            this.selectedGenres = [];
            this.statusFilter = '';
            this.sortBy = 'createdAt';
            this.searchQuery = '';
            this.applyFilters();
        },

        async handleToggleFavorite(novelId) {
            if (!this.authStore.isAuthenticated) {
                this.$router.push('/login');
                return;
            }

            try {
                const novel = this.novels.find(n => n._id === novelId);
                if (!novel) return;

                const userId = this.authStore.currentUser._id;
                const isFavorited = novel.likedBy?.includes(userId);

                if (isFavorited) {
                    await NovelService.unlike(novelId, userId);
                } else {
                    await NovelService.like(novelId, userId);
                }

                await this.loadData();
            } catch (error) {
                console.error('Error toggling favorite:', error);
            }
        }
    }
};
</script>

<style scoped>
.search-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.search-header {
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    padding: 3rem 0;
    margin-bottom: 2rem;
}

.page-title {
    color: white;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.page-title i {
    font-size: 2rem;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.search-content {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    align-items: start;
}

/* Sidebar */
.search-sidebar {
    position: sticky;
    top: 2rem;
}

.filter-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-title {
    font-size: 1.25rem;
    color: #2c3e50;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #ecf0f1;
}

.filter-group {
    margin-bottom: 1.5rem;
}

/* Override global label styles */
.filter-group label {
    margin-bottom: 0;
    padding: 0;
}

.filter-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    display: block;
}

.genre-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 0;
}

.genre-checkbox {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.5rem;
    margin: 0;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.genre-checkbox:hover {
    background: #f8f9fa;
}

.genre-checkbox input[type="checkbox"] {
    cursor: pointer;
}

.genre-checkbox span {
    font-size: 0.9rem;
    color: #2c3e50;
}

.filter-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.3s;
}

.filter-select:focus {
    outline: none;
    border-color: #c9a9a6;
}

.btn-reset {
    width: 100%;
    padding: 0.75rem;
    background: #ecf0f1;
    border: none;
    border-radius: 8px;
    color: #2c3e50;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-reset:hover {
    background: #bdc3c7;
}

/* Results */
.search-results {
    min-height: 500px;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #ecf0f1;
}

.results-title {
    font-size: 1.5rem;
    color: #2c3e50;
    margin: 0;
}

.results-count {
    font-size: 0.95rem;
    color: #7f8c8d;
    background: #ecf0f1;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
}

.pagination-btn {
    padding: 0.6rem 1rem;
    border: 1px solid #ddd;
    background: white;
    color: #2c3e50;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
    background: #c9a9a6;
    color: white;
    border-color: #c9a9a6;
}

.pagination-btn.active {
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    color: white;
    border-color: #c9a9a6;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
    .search-content {
        grid-template-columns: 240px 1fr;
        gap: 1.5rem;
    }

    .page-title {
        font-size: 2rem;
    }
}

@media (max-width: 768px) {
    .search-content {
        grid-template-columns: 1fr;
    }

    .search-sidebar {
        position: static;
    }

    .container {
        padding: 0 1rem;
    }

    .page-title {
        font-size: 1.75rem;
    }

    .results-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>
