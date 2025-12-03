<template>
    <div class="genre-detail-view">
        <div class="container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
                <router-link to="/">
                    <i class="fas fa-home"></i>
                    Trang chủ
                </router-link>
                <i class="fas fa-chevron-right"></i>
                <router-link to="/genres">Thể loại</router-link>
                <i class="fas fa-chevron-right"></i>
                <span>{{ genreName }}</span>
            </nav>

            <!-- Genre Header -->
            <div class="genre-header">
                <div class="genre-info">
                    <h1 class="genre-title">{{ genreName }}</h1>
                    <p class="genre-description">{{ genreDescription }}</p>
                    <div class="genre-stats">
                        <span>
                            <i class="fas fa-book"></i>
                            {{ novels.length }} truyện
                        </span>
                        <span>
                            <i class="fas fa-eye"></i>
                            {{ totalViews.toLocaleString() }} lượt xem
                        </span>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filters">
                <div class="filter-group">
                    <label>Sắp xếp:</label>
                    <select v-model="sortBy" class="filter-select">
                        <option value="latest">Mới nhất</option>
                        <option value="popular">Phổ biến</option>
                        <option value="views">Lượt xem</option>
                        <option value="chapters">Số chương</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Trạng thái:</label>
                    <select v-model="statusFilter" class="filter-select">
                        <option value="all">Tất cả</option>
                        <option value="ongoing">Đang ra</option>
                        <option value="completed">Hoàn thành</option>
                    </select>
                </div>
            </div>

            <!-- Novels Grid -->
            <LoadingSpinner v-if="loading" message="Đang tải truyện..." />

            <EmptyState
                v-else-if="filteredNovels.length === 0"
                icon="fa-inbox"
                title="Chưa có truyện nào"
                message="Chưa có truyện nào thuộc thể loại này"
            />

            <div v-else class="novels-grid">
                <NovelCard
                    v-for="novel in filteredNovels"
                    :key="novel._id"
                    :novel="novel"
                    @toggle-favorite="handleToggleFavorite"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { NovelService, GenreService } from '@/services';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import NovelCard from '@/components/Novel/NovelCard.vue';

export default {
    name: 'GenreDetailView',
    components: { LoadingSpinner, EmptyState, NovelCard },
    data() {
        return {
            genreSlug: this.$route.params.slug,
            genre: null,
            novels: [],
            sortBy: 'latest',
            statusFilter: 'all',
            loading: false
        };
    },
    computed: {
        genreName() {
            return this.genre?.name || 'Thể loại';
        },
        genreDescription() {
            return this.genre?.description || `Khám phá những tác phẩm ${this.genreName} hấp dẫn nhất`;
        },
        filteredNovels() {
            let result = [...this.novels];
            
            // Filter by status
            if (this.statusFilter !== 'all') {
                result = result.filter(n => n.status === this.statusFilter);
            }
            
            // Sort
            switch (this.sortBy) {
                case 'popular':
                    result.sort((a, b) => (b.views || 0) - (a.views || 0));
                    break;
                case 'views':
                    result.sort((a, b) => (b.views || 0) - (a.views || 0));
                    break;
                case 'chapters':
                    result.sort((a, b) => (b.chapterCount || 0) - (a.chapterCount || 0));
                    break;
                case 'latest':
                default:
                    result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            }
            
            return result;
        },
        totalViews() {
            return this.novels.reduce((sum, novel) => sum + (novel.views || 0), 0);
        }
    },
    async mounted() {
        await this.loadGenreData();
    },
    methods: {
        async loadGenreData() {
            this.loading = true;
            
            try {
                // Get genre by slug
                const genres = await GenreService.getAll();
                this.genre = genres.find(g => g.slug === this.genreSlug);
                
                if (!this.genre) {
                    console.error('Genre not found');
                    return;
                }
                
                // Get all novels and filter by genre name
                const allNovels = await NovelService.getAll();
                this.novels = allNovels.filter(novel => 
                    novel.genres && novel.genres.includes(this.genre.name)
                );
                
            } catch (error) {
                console.error('Error loading genre data:', error);
            } finally {
                this.loading = false;
            }
        },
        handleToggleFavorite(novelId, isFavorite) {
            // Update novel in the list
            const novel = this.novels.find(n => n._id === novelId);
            if (novel) {
                novel.favorite = isFavorite;
            }
        }
    }
};
</script>

<style scoped>
.genre-detail-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    font-size: 0.9rem;
}

.breadcrumb a {
    color: #c9a9a6;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.breadcrumb a:hover {
    color: #b8a39e;
}

.breadcrumb i.fa-chevron-right {
    color: #95a5a6;
    font-size: 0.75rem;
}

.breadcrumb span {
    color: #2c3e50;
    font-weight: 600;
}

/* Genre Header */
.genre-header {
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.genre-info {
    width: 100%;
}

.genre-title {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
}

.genre-description {
    margin: 0 0 1rem 0;
    color: #7f8c8d;
    line-height: 1.6;
}

.genre-stats {
    display: flex;
    gap: 2rem;
    font-size: 0.95rem;
    color: #95a5a6;
}

.genre-stats span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.genre-stats i {
    color: #c9a9a6;
}

/* Filters */
.filters {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.filter-group label {
    font-weight: 600;
    color: #2c3e50;
}

.filter-select {
    padding: 0.5rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-select:focus {
    outline: none;
    border-color: #c9a9a6;
}

/* Novels Grid */
.novels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

@media (max-width: 768px) {
    .filters {
        flex-direction: column;
        gap: 1rem;
    }
    
    .novels-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}
</style>
