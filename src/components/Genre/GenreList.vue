<template>
    <div class="genre-list">
        <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải thể loại...</p>
        </div>

        <div v-else-if="error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="genres.length === 0" class="empty">
            <i class="fas fa-inbox"></i>
            <p>Chưa có thể loại nào</p>
        </div>

        <div v-else class="genre-grid">
            <GenreCard 
                v-for="genre in genres" 
                :key="genre._id || genre.slug"
                :genre="genre"
            />
        </div>
    </div>
</template>

<script>
import GenreCard from './GenreCard.vue';

export default {
    name: 'GenreList',
    components: {
        GenreCard
    },
    props: {
        genres: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: null
        }
    }
};
</script>

<style scoped>
.genre-list {
    width: 100%;
}

.genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.loading,
.error,
.empty {
    text-align: center;
    padding: 3rem 1rem;
}

.loading i,
.error i,
.empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #c9a9a6;
}

.loading p,
.error p,
.empty p {
    margin: 0;
    font-size: 1.125rem;
    color: #7f8c8d;
}

.error i {
    color: #e74c3c;
}

@media (max-width: 768px) {
    .genre-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .genre-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
