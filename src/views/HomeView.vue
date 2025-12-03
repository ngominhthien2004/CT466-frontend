<template>
    <div class="home">
        <!-- Hero Banner -->
        <div class="hero-banner">
            <div class="hero-content">
                <h1 class="hero-title">
                    <i class="fas fa-book-open"></i>
                    Chào mừng đến với NovelMT
                </h1>
                <p class="hero-subtitle">Khám phá thế giới truyện chữ đầy màu sắc</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <i class="fas fa-book"></i>
                        <div class="stat-info">
                            <span class="stat-number">{{ totalNovels }}</span>
                            <span class="stat-label">Truyện</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-eye"></i>
                        <div class="stat-info">
                            <span class="stat-number">{{ totalViews }}</span>
                            <span class="stat-label">Lượt xem</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <div class="stat-info">
                            <span class="stat-number">1000+</span>
                            <span class="stat-label">Độc giả</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- Search Section -->
            <section class="search-section">
                <SearchNovel
                    :novels="newNovels"
                    :show-suggestions-on-type="true"
                    @search="handleSearch"
                    @clear="handleSearchClear"
                    @select="handleSelectSuggestion"
                />
                
                <div v-if="isSearching" class="search-filters">
                    <FilterBar
                        :status-filter="searchFilterStatus"
                        :sort-by="searchSortBy"
                        :status-options="statusOptions"
                        :sort-options="sortOptions"
                        @update:statusFilter="searchFilterStatus = $event"
                        @update:sortBy="searchSortBy = $event"
                        @filter-change="handleFilterChange"
                        @sort-change="handleFilterChange"
                        @reset="handleSearchReset"
                    />
                </div>
            </section>

            <!-- Search Results -->
            <section v-if="isSearching" class="novel-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-search"></i>
                        Kết quả tìm kiếm
                    </h2>
                    <span class="search-count">{{ searchResults.length }} kết quả</span>
                </div>
                <NovelList 
                    v-if="searchResults.length > 0"
                    :novels="searchResults"
                    :loading="false"
                    :items-per-page="12"
                    @toggle-favorite="handleToggleFavorite"
                />
                <EmptyState
                    v-else
                    icon="fa-inbox"
                    title="Không tìm thấy kết quả nào"
                />
            </section>

            <!-- Tiểu thuyết mới -->
            <section v-if="!isSearching" class="novel-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-fire"></i>
                        Truyện Mới Cập Nhật
                    </h2>
                    <router-link to="/novels" class="view-all">
                        Xem tất cả
                        <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
                <NovelList 
                    :novels="newNovels"
                    :loading="loadingNew"
                    :items-per-page="6"
                    @toggle-favorite="handleToggleFavorite"
                />
            </section>

            <!-- Tiểu thuyết nổi bật -->
            <section class="novel-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-star"></i>
                        Truyện Nổi Bật
                    </h2>
                    <router-link to="/novels?sort=views" class="view-all">
                        Xem tất cả
                        <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
                <NovelList 
                    :novels="featuredNovels"
                    :loading="loadingFeatured"
                    :items-per-page="6"
                    @toggle-favorite="handleToggleFavorite"
                />
            </section>
        </div>
    </div>
</template>

<script>
import NovelList from '@/components/Novel/NovelList.vue';
import SearchNovel from '@/components/Novel/SearchNovel.vue';
import FilterBar from '@/components/Common/FilterBar.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import { NovelService } from '@/services';

export default {
    name: 'HomeView',
    components: {
        NovelList,
        SearchNovel,
        FilterBar,
        EmptyState
    },
    data() {
        return {
            newNovels: [],
            featuredNovels: [],
            loadingNew: false,
            loadingFeatured: false,
            searchResults: [],
            isSearching: false,
            searchFilterStatus: '',
            searchSortBy: 'createdAt',
            statusOptions: {
                placeholder: 'Tất cả trạng thái',
                options: [
                    { value: 'ongoing', label: 'Đang ra' },
                    { value: 'completed', label: 'Hoàn thành' },
                    { value: 'paused', label: 'Tạm dừng' },
                    { value: 'dropped', label: 'Ngưng' }
                ]
            },
            sortOptions: {
                options: [
                    { value: 'createdAt', label: 'Mới nhất' },
                    { value: 'views', label: 'Lượt xem' },
                    { value: 'likes', label: 'Lượt thích' },
                    { value: 'title', label: 'Tên A-Z' }
                ]
            }
        };
    },
    computed: {
        totalNovels() {
            return this.newNovels.length;
        },
        totalViews() {
            const total = this.newNovels.reduce((sum, novel) => sum + (novel.views || 0), 0);
            return total > 1000 ? `${(total / 1000).toFixed(1)}K` : total;
        }
    },
    async mounted() {
        await this.fetchNovels();
    },
    methods: {
        async fetchNovels() {
            try {
                this.loadingNew = true;
                this.loadingFeatured = true;

                // Lấy tất cả novels
                const allNovels = await NovelService.getAll();

                // Novels mới (sắp xếp theo createdAt)
                this.newNovels = allNovels
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Novels nổi bật (sắp xếp theo views)
                this.featuredNovels = allNovels
                    .sort((a, b) => (b.views || 0) - (a.views || 0));

            } catch (error) {
                console.error('Error fetching novels:', error);
                alert('Không thể tải danh sách tiểu thuyết');
            } finally {
                this.loadingNew = false;
                this.loadingFeatured = false;
            }
        },
        async handleToggleFavorite(novelId, isFavorite) {
            try {
                await NovelService.update(novelId, { favorite: isFavorite });
                
                // Update local data
                this.updateNovelFavorite(this.newNovels, novelId, isFavorite);
                this.updateNovelFavorite(this.featuredNovels, novelId, isFavorite);
            } catch (error) {
                console.error('Error updating favorite:', error);
                alert('Không thể cập nhật yêu thích');
            }
        },
        updateNovelFavorite(novels, novelId, isFavorite) {
            const novel = novels.find(n => n._id === novelId);
            if (novel) {
                novel.favorite = isFavorite;
            }
        },
        handleSearch(query) {
            if (!query.trim()) {
                this.isSearching = false;
                this.searchResults = [];
                return;
            }
            
            const searchTerm = query.toLowerCase();
            let results = this.newNovels.filter(novel =>
                novel.title?.toLowerCase().includes(searchTerm) ||
                novel.author?.toLowerCase().includes(searchTerm) ||
                novel.genres?.some(g => g.toLowerCase().includes(searchTerm))
            );
            
            // Apply status filter
            if (this.searchFilterStatus) {
                results = results.filter(novel => novel.status === this.searchFilterStatus);
            }
            
            // Apply sorting
            const sortFunctions = {
                'createdAt': (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
                'views': (a, b) => (b.views || 0) - (a.views || 0),
                'likes': (a, b) => (b.likes || 0) - (a.likes || 0),
                'title': (a, b) => (a.title || '').localeCompare(b.title || '')
            };
            
            results.sort(sortFunctions[this.searchSortBy]);
            
            this.searchResults = results;
            this.isSearching = true;
        },
        handleSearchClear() {
            this.isSearching = false;
            this.searchResults = [];
            this.searchFilterStatus = '';
            this.searchSortBy = 'createdAt';
        },
        handleFilterChange() {
            if (this.isSearching) {
                // Re-apply search with new filters
                const searchInput = document.querySelector('.search-novel input');
                if (searchInput && searchInput.value) {
                    this.handleSearch(searchInput.value);
                }
            }
        },
        handleSearchReset() {
            this.searchFilterStatus = '';
            this.searchSortBy = 'createdAt';
            this.handleFilterChange();
        },
        handleSelectSuggestion(novel) {
            this.$router.push(`/novels/${novel._id}`);
        }
    }
};
</script>

<style scoped>
.home {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Hero Banner */
.hero-banner {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 4rem 0;
    margin-bottom: 3rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hero-content {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    font-weight: 800;
    color: white;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 2.5rem 0;
    font-weight: 300;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 1.25rem 2rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.stat-item:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-5px);
}

.stat-item i {
    font-size: 2.5rem;
    color: white;
}

.stat-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    line-height: 1;
}

.stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 0.25rem;
}

/* Container */
.container {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem 3rem 2rem;
}

/* Search Section */
.search-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-filters {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid #f8f9fa;
}

.search-count {
    color: #7f8c8d;
    font-size: 1rem;
    font-weight: 500;
}

/* Novel Section */
.novel-section {
    margin-bottom: 3rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid #c9a9a6;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title i {
    color: #c9a9a6;
    font-size: 1.75rem;
}

.view-all {
    color: #c9a9a6;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    padding: 0.5rem 1rem;
    border-radius: 8px;
}

.view-all:hover {
    background: rgba(201, 169, 166, 0.1);
    gap: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .hero-stats {
        gap: 1.5rem;
    }

    .stat-item {
        padding: 1rem 1.5rem;
    }

    .stat-item i {
        font-size: 2rem;
    }

    .stat-number {
        font-size: 1.5rem;
    }

    .container {
        width: 100%;
        padding: 0 1rem 2rem 1rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .section-title {
        font-size: 1.5rem;
    }

    .view-all {
        align-self: flex-end;
    }
}

@media (max-width: 480px) {
    .hero-banner {
        padding: 2.5rem 0;
    }

    .hero-title {
        font-size: 1.5rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .hero-stats {
        flex-direction: column;
        gap: 1rem;
    }

    .stat-item {
        width: 100%;
        justify-content: center;
    }
}
</style>
