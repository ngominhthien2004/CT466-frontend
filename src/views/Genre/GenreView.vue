<template>
    <div class="genre-view">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-layer-group"></i>
                    Thể loại tiểu thuyết
                </h1>
                <p class="subtitle">
                    Khám phá thế giới tiểu thuyết đa dạng theo từng thể loại
                </p>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
            <div class="stat-item">
                <i class="fas fa-layer-group"></i>
                <div class="stat-content">
                    <span class="stat-value">{{ genres.length }}</span>
                    <span class="stat-label">Thể loại</span>
                </div>
            </div>
        </div>

        <!-- Search Section -->
        <div class="search-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Tìm kiếm thể loại..."
                />
            </div>
        </div>

        <div class="container">
            <GenreList 
                :genres="paginatedGenres"
                :loading="loading"
                :error="error"
            />
            
            <!-- Pagination -->
            <Pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredGenres.length"
                @change="goToPage"
            />
        </div>
    </div>
</template>

<script>
import GenreList from '@/components/Genre/GenreList.vue';
import Pagination from '@/components/Common/Pagination.vue';
import GenreService from '@/services/genre.service';

export default {
    name: 'GenreView',
    components: {
        GenreList,
        Pagination
    },
    data() {
        return {
            genres: [],
            searchQuery: '',
            loading: false,
            error: null,
            currentPage: 1,
            itemsPerPage: 12
        };
    },
    computed: {
        filteredGenres() {
            if (!this.searchQuery.trim()) return this.genres;
            const query = this.searchQuery.toLowerCase().trim();
            return this.genres.filter(genre =>
                genre.name.toLowerCase().includes(query) ||
                genre.description?.toLowerCase().includes(query)
            );
        },
        totalPages() {
            return Math.ceil(this.filteredGenres.length / this.itemsPerPage);
        },
        paginatedGenres() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredGenres.slice(start, end);
        }
    },
    watch: {
        searchQuery() {
            this.currentPage = 1;
        }
    },
    async mounted() {
        await this.loadGenres();
    },
    methods: {
        async loadGenres() {
            this.loading = true;
            this.error = null;
            try {
                const response = await GenreService.getAll();
                this.genres = response || [];
            } catch (err) {
                console.error('Error loading genres:', err);
                this.error = 'Không thể tải danh sách thể loại. Vui lòng thử lại!';
            } finally {
                this.loading = false;
            }
        },
        goToPage(page) {
            this.currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
};
</script>

<style scoped>
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    font-weight: 300;
}

/* Stats Bar */
.stats-bar {
    max-width: 1200px;
    margin: -1.5rem auto 2rem;
    padding: 0 2rem;
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    z-index: 10;
}

.stat-item {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s;
    flex: 1;
    min-width: 200px;
}

.stat-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-item i {
    font-size: 2rem;
    color: #c9a9a6;
}

.stat-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-top: 0.25rem;
}

/* Search Section */
.search-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 2rem;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.search-box i {
    position: absolute;
    left: 1.5rem;
    color: #95a9a6;
    font-size: 1.25rem;
}

.search-box input {
    width: 100%;
    padding: 1.25rem 1.25rem 1.25rem 4rem;
    border: none;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
}

.search-box input::placeholder {
    color: #bdc3c7;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 3rem;
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        padding: 2rem 0;
    }

    .header-content h1 {
        font-size: 1.75rem;
        flex-direction: column;
        gap: 0.5rem;
    }

    .subtitle {
        font-size: 1rem;
    }

    .stats-bar {
        margin-top: -1rem;
        flex-direction: column;
        gap: 1rem;
    }

    .stat-item {
        min-width: auto;
        width: 100%;
    }

    .container {
        padding: 0 1rem 2rem;
    }

    .search-section {
        padding: 0 1rem;
    }
}
</style>
