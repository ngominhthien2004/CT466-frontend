<template>
    <div class="chapter-card" @click="readChapter">
        <div class="chapter-info">
            <h4 class="chapter-title">{{ chapter.title }}</h4>
            <p class="chapter-date">{{ formatDate(chapter.createdAt) }}</p>
        </div>
        <div class="chapter-meta">
            <span class="views">
                <i class="fas fa-eye"></i>
                {{ formatNumber(chapter.views || 0) }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChapterCard',
    props: {
        chapter: {
            type: Object,
            required: true
        }
    },
    methods: {
        readChapter() {
            this.$emit('read', this.chapter._id);
        },
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        },
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num;
        }
    }
};
</script>

<style scoped>
.chapter-card {
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: 1px solid #ecf0f1;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chapter-card:hover {
    border-color: #c9a9a6;
    background: #fafafa;
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-info {
    flex: 1;
}

.chapter-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.25rem 0;
}

.chapter-date {
    font-size: 0.85rem;
    color: #95a5a6;
    margin: 0;
}

.chapter-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.views {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #7f8c8d;
    font-size: 0.9rem;
}

.views i {
    color: #c9a9a6;
}

@media (max-width: 768px) {
    .chapter-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
