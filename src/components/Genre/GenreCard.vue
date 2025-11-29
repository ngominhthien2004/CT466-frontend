<template>
    <router-link :to="`/genres/${genre.slug}`" class="genre-card">
        <div class="genre-icon">
            <i :class="genre.icon"></i>
        </div>
        <div class="genre-content">
            <h3 class="genre-name">{{ genre.name }}</h3>
            <p class="genre-count">{{ genre.novelCount || 0 }} truyện</p>
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
.genre-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
}

.genre-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.2);
}

.genre-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
    border-radius: 12px;
    flex-shrink: 0;
}

.genre-icon i {
    font-size: 1.75rem;
    color: white;
}

.genre-content {
    flex: 1;
}

.genre-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: #2c3e50;
}

.genre-count {
    margin: 0;
    font-size: 0.9rem;
    color: #7f8c8d;
}

.genre-arrow {
    color: #c9a9a6;
    font-size: 1.25rem;
}

@media (max-width: 768px) {
    .genre-card {
        padding: 1rem;
        gap: 1rem;
    }
    
    .genre-icon {
        width: 50px;
        height: 50px;
    }
    
    .genre-icon i {
        font-size: 1.5rem;
    }
    
    .genre-name {
        font-size: 1rem;
    }
}
</style>
