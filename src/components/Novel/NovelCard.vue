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
/* Card styles moved to cards.css */
</style>
