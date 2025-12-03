<template>
    <div class="chapter-card">
        <div class="chapter-info" @click="readChapter">
            <h4 class="chapter-title">
                <span v-if="chapter.chapterNumber" class="chapter-number">Chương {{ chapter.chapterNumber }}</span>
                {{ chapter.title }}
            </h4>
            <p class="chapter-date">{{ formatDate(chapter.createdAt) }}</p>
        </div>
        <div class="chapter-meta">
            <span class="views">
                <i class="fas fa-eye"></i>
                {{ formatNumber(chapter.views || 0) }}
            </span>
            <button class="btn-edit" @click.stop="editChapter" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
            </button>
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
        editChapter() {
            this.$emit('edit', this.chapter._id);
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
/* Card styles moved to cards.css */

/* Custom transparent edit button for this component */
.btn-edit {
    background: transparent;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-edit:hover {
    background: #f0f0f0;
    color: #c9a9a6;
    transform: scale(1.1);
}
</style>
