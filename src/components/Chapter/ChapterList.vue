<template>
    <div class="chapter-list">
        <div class="list-header">
            <h2>Danh sách chương</h2>
            <div class="list-controls">
                <button class="btn-add-chapter" @click="addChapter">
                    <i class="fas fa-plus"></i>
                    Thêm chương
                </button>
                <button 
                    class="sort-btn" 
                    :class="{ active: sortOrder === 'asc' }"
                    @click="toggleSort"
                >
                    <i class="fas fa-sort-amount-down"></i>
                    {{ sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất' }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">
            <p>Đang tải danh sách chương...</p>
        </div>

        <div v-else-if="chapters.length === 0" class="empty">
            <i class="fas fa-book-open"></i>
            <p>Chưa có chương nào</p>
        </div>

        <div v-else class="chapters-grid">
            <ChapterCard 
                v-for="chapter in sortedChapters" 
                :key="chapter._id"
                :chapter="chapter"
                @read="handleReadChapter"
                @edit="handleEditChapter"
            />
        </div>
    </div>
</template>

<script>
import ChapterCard from './ChapterCard.vue';

export default {
    name: 'ChapterList',
    components: {
        ChapterCard
    },
    props: {
        chapters: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        novelId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            sortOrder: 'desc' // 'asc' hoặc 'desc'
        };
    },
    computed: {
        sortedChapters() {
            const sorted = [...this.chapters];
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
            return sorted;
        }
    },
    methods: {
        toggleSort() {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        },
        addChapter() {
            this.$router.push(`/chapters/add?novelId=${this.novelId}`);
        },
        handleReadChapter(chapterId) {
            this.$emit('read-chapter', chapterId);
        },
        handleEditChapter(chapterId) {
            this.$router.push(`/chapters/edit/${chapterId}`);
        }
    }
};
</script>

<style scoped>
.chapter-list {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
    margin: 0 auto 2rem;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #ecf0f1;
}

.list-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
}

.list-controls {
    display: flex;
    gap: 0.5rem;
}

.btn-add-chapter {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #27ae60;
    color: #27ae60;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-add-chapter:hover {
    background: #27ae60;
    color: white;
}

.sort-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #dfe6e9;
    color: #2c3e50;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sort-btn:hover {
    border-color: #c9a9a6;
    color: #c9a9a6;
}

.sort-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    border-color: #c9a9a6;
    color: white;
}

.loading,
.empty {
    text-align: center;
    padding: 3rem 0;
    color: #95a5a6;
}

.empty i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #dfe6e9;
}

.empty p {
    font-size: 1.1rem;
    margin: 0;
}

.chapters-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (max-width: 768px) {
    .chapter-list {
        padding: 1.5rem;
    }

    .list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>
