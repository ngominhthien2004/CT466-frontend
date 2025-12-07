<template>
    <router-link :to="`/genres/${genre.slug}`" class="genre-card">
        <div class="genre-content">
            <h3 class="genre-name">{{ genre.name }}</h3>
            <p class="genre-count">{{ genre.novelCount || 0 }} tiểu thuyết</p>
        </div>
        <div class="genre-arrow">
            <i class="fas fa-chevron-right"></i>
        </div>
    </router-link>
</template>

<script>
export default {
    name: 'GenreCard',
    props: {
        genre: {
            type: Object,
            required: true
        }
    }
};
</script>

<style scoped>
</style>
