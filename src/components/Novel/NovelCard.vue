<template>
    <div class="novel-card" @click="goToDetail">
        <div class="novel-image">
            <img :src="novel.coverImage || '/default-book.png'" :alt="novel.title" />
            <div class="favorite-btn" @click.stop="toggleFavorite">
                <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
            </div>
        </div>
        <div class="novel-info">
            <h3 class="novel-title">{{ novel.title }}</h3>
            <p class="novel-description">{{ truncatedDescription }}</p>
            <div class="novel-meta">
                <span class="author">{{ novel.author }}</span>
                <span class="views">
                    <i class="fas fa-eye"></i> {{ formatViews(novel.views) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NovelCard',
    props: {
        novel: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isFavorite: false
        };
    },
    computed: {
        truncatedDescription() {
            if (!this.novel.description) return 'Chưa có mô tả...';
            return this.novel.description.length > 100 
                ? this.novel.description.substring(0, 100) + '...' 
                : this.novel.description;
        }
    },
    mounted() {
        this.isFavorite = this.novel.favorite || false;
    },
    methods: {
        goToDetail() {
            this.$router.push(`/novels/${this.novel._id}`);
        },
        toggleFavorite() {
            this.isFavorite = !this.isFavorite;
            this.$emit('toggle-favorite', this.novel._id, this.isFavorite);
        },
        formatViews(views) {
            if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
            if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
            return views || 0;
        }
    }
};
</script>

<style scoped>
.novel-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.novel-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.novel-image {
    position: relative;
    padding-top: 140%;
    overflow: hidden;
    background: #f0f0f0;
}

.novel-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.favorite-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 10;
}

.favorite-btn:hover {
    background: white;
    transform: scale(1.1);
}

.favorite-btn i {
    font-size: 1.2rem;
    color: #e74c3c;
}

.novel-info {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.novel-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.novel-description {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0 0 1rem 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.novel-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #95a5a6;
}

.author {
    font-weight: 500;
}

.views {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}
</style>
