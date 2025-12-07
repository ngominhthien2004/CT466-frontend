<template>
    <div class="genre-detail-view">
        <!-- Breadcrumb Bar -->
        <div class="breadcrumb-bar">
            <div class="container">
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
            </div>
        </div>

        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>{{ genreName }}</h1>
                <p class="subtitle">{{ genreDescription }}</p>
                <div class="genre-stats">
                    <div class="stat-badge">
                        <i class="fas fa-book"></i>
                        <span>{{ novels.length }} tiểu thuyết</span>
                    </div>
                    <div class="stat-badge">
                        <i class="fas fa-eye"></i>
                        <span>{{ totalViews.toLocaleString() }} lượt xem</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- Filters -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>
                        <i class="fas fa-sort"></i>
                        Sắp xếp
                    </label>
                    <select v-model="sortBy" class="filter-select">
                        <option value="latest">Mới nhất</option>
                        <option value="popular">Phổ biến</option>
                        <option value="views">Lượt xem</option>
                        <option value="chapters">Số chương</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>
                        <i class="fas fa-filter"></i>
                        Trạng thái
                    </label>
                    <select v-model="statusFilter" class="filter-select">
                        <option value="all">Tất cả</option>
                        <option value="ongoing">Đang ra</option>
                        <option value="completed">Hoàn thành</option>
                    </select>
                </div>

                <button @click="resetFilters" class="btn-reset" title="Đặt lại bộ lọc">
                    <i class="fas fa-redo"></i>
                </button>
            </div>

            <!-- Novels Grid -->
            <LoadingSpinner v-if="loading" message="Đang tải tiểu thuyết..." />

            <EmptyState
                v-else-if="filteredNovels.length === 0"
                icon="fa-inbox"
                title="Chưa có tiểu thuyết nào"
                message="Chưa có tiểu thuyết nào thuộc thể loại này"
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
                
                // Get all novels and filter by genre
                const allNovels = await NovelService.getAll();
                
                // Filter novels by genre - handle both string and object genres
                // Similar to Search.vue filtering logic
                this.novels = allNovels.filter(novel => {
                    if (!novel.genres || novel.genres.length === 0) return false;
                    
                    // Check if novel has this genre (handle both string and object)
                    return novel.genres.some(genre => {
                        // If genre is a string, compare with genre name
                        if (typeof genre === 'string') {
                            return genre === this.genre.name;
                        }
                        // If genre is an object, compare _id
                        if (typeof genre === 'object' && genre._id) {
                            return genre._id.toString() === this.genre._id.toString();
                        }
                        return false;
                    });
                });
                
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
        },
        resetFilters() {
            this.sortBy = 'latest';
            this.statusFilter = 'all';
        }
    }
};
</script>

<style scoped>
.genre-detail-view {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Breadcrumb Bar */
.breadcrumb-bar {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 1rem 0;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.breadcrumb a {
    color: #c9a9a6;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.3s;
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

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 3rem 0;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}

.header-content h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.75rem 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 1.5rem 0;
    font-weight: 300;
}

.genre-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.stat-badge {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s;
}

.stat-badge:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.stat-badge i {
    font-size: 1rem;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 3rem;
}

/* Filters Section */
.filters-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    flex-wrap: wrap;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.filter-group label {
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
}

.filter-group label i {
    color: #c9a9a6;
}

 

/* Novels Grid */
.novels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        padding: 2rem 0;
    }

    .header-content h1 {
        font-size: 1.75rem;
    }

    .subtitle {
        font-size: 1rem;
    }

    .genre-stats {
        flex-direction: column;
        gap: 0.75rem;
    }

    .stat-badge {
        width: 100%;
        justify-content: center;
    }

    .container {
        padding: 0 1rem 2rem;
    }

    .filters-section {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
    }

    .filter-group {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
    }

    .filter-select {
        width: 100%;
    }
    
    .novels-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}
</style>
