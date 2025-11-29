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
                // TODO: Replace with actual API call when backend is ready
                // const response = await GenreService.getAll();
                // this.genres = response;
                
                // Mock data for now
                this.genres = this.getMockGenres();
            } catch (error) {
                console.error('Error loading genres:', error);
                this.error = 'Không thể tải danh sách thể loại. Vui lòng thử lại!';
            } finally {
                this.loading = false;
            }
        },
        getMockGenres() {
            return [
                { slug: 'tien-hiep', name: 'Tiên Hiệp', icon: 'fas fa-yin-yang', novelCount: 245 },
                { slug: 'huyen-huyen', name: 'Huyền Huyễn', icon: 'fas fa-hat-wizard', novelCount: 189 },
                { slug: 'khoa-huyen', name: 'Khoa Huyễn', icon: 'fas fa-rocket', novelCount: 156 },
                { slug: 'do-thi', name: 'Đô Thị', icon: 'fas fa-city', novelCount: 203 },
                { slug: 'dam-my', name: 'Đam Mỹ', icon: 'fas fa-heart', novelCount: 134 },
                { slug: 'ngon-tinh', name: 'Ngôn Tình', icon: 'fas fa-kiss-wink-heart', novelCount: 298 },
                { slug: 'co-dai', name: 'Cổ Đại', icon: 'fas fa-landmark', novelCount: 167 },
                { slug: 'kiem-hiep', name: 'Kiếm Hiệp', icon: 'fas fa-skull-crossbones', novelCount: 142 },
                { slug: 'lich-su', name: 'Lịch Sử', icon: 'fas fa-book-open', novelCount: 98 },
                { slug: 'quan-truong', name: 'Quan Trường', icon: 'fas fa-briefcase', novelCount: 76 },
                { slug: 'linh-di', name: 'Linh Dị', icon: 'fas fa-ghost', novelCount: 112 },
                { slug: 'vong-du', name: 'Võng Du', icon: 'fas fa-gamepad', novelCount: 189 },
                { slug: 'tham-hiem', name: 'Thám Hiểm', icon: 'fas fa-compass', novelCount: 87 },
                { slug: 'dien-van', name: 'Diễn Văn', icon: 'fas fa-microphone', novelCount: 54 },
                { slug: 'quan-su', name: 'Quân Sự', icon: 'fas fa-shield-alt', novelCount: 92 },
                { slug: 'teen', name: 'Teen', icon: 'fas fa-child', novelCount: 213 }
            ];
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
