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
                <div class="genre-icon">
                    <i :class="genreIcon"></i>
                </div>
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
            <div v-if="loading" class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải truyện...</p>
            </div>

            <div v-else-if="filteredNovels.length === 0" class="empty">
                <i class="fas fa-inbox"></i>
                <p>Chưa có truyện nào thuộc thể loại này</p>
            </div>

            <div v-else class="novels-grid">
                <div v-for="novel in filteredNovels" :key="novel._id" class="novel-card">
                    <router-link :to="`/novels/${novel._id}`" class="novel-link">
                        <img :src="novel.coverImage" :alt="novel.title" class="novel-cover" />
                        <div class="novel-overlay">
                            <span class="novel-status" :class="novel.status">
                                {{ novel.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành' }}
                            </span>
                        </div>
                    </router-link>
                    <div class="novel-info">
                        <router-link :to="`/novels/${novel._id}`" class="novel-title">
                            {{ novel.title }}
                        </router-link>
                        <p class="novel-author">{{ novel.author }}</p>
                        <div class="novel-stats">
                            <span><i class="fas fa-eye"></i> {{ novel.views }}</span>
                            <span><i class="fas fa-book"></i> {{ novel.chapterCount }} chương</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GenreDetailView',
    data() {
        return {
            genreSlug: this.$route.params.slug,
            genreName: '',
            genreIcon: 'fas fa-layer-group',
            genreDescription: '',
            novels: [],
            sortBy: 'latest',
            statusFilter: 'all',
            loading: false
        };
    },
    computed: {
        filteredNovels() {
            let result = [...this.novels];
            
            // Filter by status
            if (this.statusFilter !== 'all') {
                result = result.filter(n => n.status === this.statusFilter);
            }
            
            // Sort
            switch (this.sortBy) {
                case 'popular':
                    result.sort((a, b) => b.views - a.views);
                    break;
                case 'views':
                    result.sort((a, b) => b.views - a.views);
                    break;
                case 'chapters':
                    result.sort((a, b) => b.chapterCount - a.chapterCount);
                    break;
                case 'latest':
                default:
                    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
                // TODO: Replace with actual API call
                // const response = await GenreService.getBySlug(this.genreSlug);
                
                // Mock data
                this.genreName = this.getGenreName(this.genreSlug);
                this.genreIcon = this.getGenreIcon(this.genreSlug);
                this.genreDescription = `Khám phá những tác phẩm ${this.genreName} hấp dẫn nhất`;
                this.novels = this.getMockNovels();
            } catch (error) {
                console.error('Error loading genre data:', error);
            } finally {
                this.loading = false;
            }
        },
        getGenreName(slug) {
            const genreMap = {
                'tien-hiep': 'Tiên Hiệp',
                'huyen-huyen': 'Huyền Huyễn',
                'khoa-huyen': 'Khoa Huyễn',
                'do-thi': 'Đô Thị',
                'ngon-tinh': 'Ngôn Tình'
            };
            return genreMap[slug] || 'Thể loại';
        },
        getGenreIcon(slug) {
            const iconMap = {
                'tien-hiep': 'fas fa-yin-yang',
                'huyen-huyen': 'fas fa-hat-wizard',
                'khoa-huyen': 'fas fa-rocket',
                'do-thi': 'fas fa-city',
                'ngon-tinh': 'fas fa-kiss-wink-heart'
            };
            return iconMap[slug] || 'fas fa-layer-group';
        },
        getMockNovels() {
            // Mock data - replace with API call
            return Array(12).fill(null).map((_, i) => ({
                _id: `novel-${i}`,
                title: `Truyện ${this.genreName} ${i + 1}`,
                author: `Tác giả ${i + 1}`,
                coverImage: '/assets/placeholder-cover.jpg',
                status: i % 3 === 0 ? 'completed' : 'ongoing',
                views: Math.floor(Math.random() * 100000),
                chapterCount: Math.floor(Math.random() * 500) + 50,
                createdAt: new Date(Date.now() - Math.random() * 10000000000)
            }));
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
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.genre-icon {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    border-radius: 20px;
    flex-shrink: 0;
}

.genre-icon i {
    font-size: 3rem;
    color: white;
}

.genre-info {
    flex: 1;
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

/* Loading & Empty */
.loading,
.empty {
    text-align: center;
    padding: 4rem 1rem;
    background: white;
    border-radius: 12px;
}

.loading i,
.empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #c9a9a6;
}

/* Novels Grid */
.novels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

.novel-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.novel-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.2);
}

.novel-link {
    position: relative;
    display: block;
    overflow: hidden;
}

.novel-cover {
    width: 100%;
    height: 260px;
    object-fit: cover;
}

.novel-overlay {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.novel-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.95);
    color: #2c3e50;
}

.novel-status.completed {
    background: #27ae60;
    color: white;
}

.novel-info {
    padding: 1rem;
}

.novel-title {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 700;
    color: #2c3e50;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.novel-title:hover {
    color: #c9a9a6;
}

.novel-author {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.novel-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #95a5a6;
}

.novel-stats span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

@media (max-width: 768px) {
    .genre-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
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
