<template>
    <div class="genre-view">
        <div class="container">
            <GenreHeader 
                :total-genres="filteredGenres.length"
                v-model:search-query="searchQuery"
            />
            
            <GenreList 
                :genres="filteredGenres"
                :loading="loading"
                :error="error"
            />
        </div>
    </div>
</template>

<script>

import GenreHeader from '@/components/Genre/GenreHeader.vue';
import GenreList from '@/components/Genre/GenreList.vue';
import GenreService from '@/services/genre.service';

export default {
    name: 'GenreView',
    components: {
        GenreHeader,
        GenreList
    },
    data() {
        return {
            genres: [],
            searchQuery: '',
            loading: false,
            error: null
        };
    },
    computed: {
        filteredGenres() {
            if (!this.searchQuery.trim()) {
                return this.genres;
            }
            
            const query = this.searchQuery.toLowerCase().trim();
            return this.genres.filter(genre => 
                genre.name.toLowerCase().includes(query) ||
                genre.description?.toLowerCase().includes(query)
            );
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
                this.genres = response;
            } catch (error) {
                console.error('Error loading genres:', error);
                this.error = 'Không thể tải danh sách thể loại. Vui lòng thử lại!';
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.genre-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

@media (max-width: 768px) {
    .genre-view {
        padding: 1rem 0;
    }
}
</style>
