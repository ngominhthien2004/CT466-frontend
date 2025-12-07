<template>
    <div class="novel-list">
        <div class="section-header">
            <h2>{{ title }}</h2>
            <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
        
        <div v-if="loading" class="loading">
            <p>Đang tải...</p>
        </div>

        <div v-else-if="novels.length === 0" class="empty">
            <p>Không có tiểu thuyết nào</p>
        </div>

        <template v-else>
            <div class="novel-grid">
                <NovelCard 
                    v-for="novel in paginatedNovels" 
                    :key="novel._id" 
                    :novel="novel"
                    :is-favorite="isNovelFavorited(novel)"
                    @toggle-favorite="handleToggleFavorite"
                />
            </div>

            <!-- Pagination -->
            <Pagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="novels.length"
                @change="goToPage"
            />
        </template>
    </div>
</template>

<script>
import NovelCard from './NovelCard.vue';
import { useAuthStore } from '@/stores';
import Pagination from '@/components/Common/Pagination.vue';

export default {
    name: 'NovelList',
    components: {
        NovelCard,
        Pagination
    },
    props: {
        title: {
            type: String,
            default: 'Tiểu thuyết'
        },
        subtitle: {
            type: String,
            default: ''
        },
        novels: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        itemsPerPage: {
            type: Number,
            default: 12
        }
    },
    data() {
        return {
            currentPage: 1,
            authStore: useAuthStore()
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.novels.length / this.itemsPerPage);
        },
        paginatedNovels() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.novels.slice(start, end);
        }
    },
    watch: {
        novels() {
            // Reset về trang 1 khi danh sách novels thay đổi
            this.currentPage = 1;
        }
    },
    methods: {
        isNovelFavorited(novel) {
            const userId = this.authStore.user?._id;
            if (!userId || !novel) return false;
            return novel.favoritedBy?.includes(userId) || false;
        },
        handleToggleFavorite(novelId) {
            this.$emit('toggle-favorite', novelId);
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                // Scroll to top of novel list
                this.$el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
};
</script>

<style scoped>
.novel-list {
    margin-bottom: 3rem;
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
    margin-bottom: 2rem;
}

.section-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
}

.subtitle {
    font-size: 1rem;
    color: #95a5a6;
    margin: 0;
}

.novel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    width: 100%;
}

/* Pagination handled by shared Pagination.vue component styles */

@media (max-width: 1024px) {
    .novel-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1.2rem;
    }
}

@media (max-width: 768px) {
    .novel-list {
        padding: 1.5rem;
    }
    
    .novel-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .pagination {
        gap: 0.3rem;
    }

    .page-btn {
        min-width: 36px;
        height: 36px;
        padding: 0 8px;
        font-size: 0.85rem;
    }

    .page-info {
        width: 100%;
        margin: 0.5rem 0 0 0;
        padding: 0.5rem 0 0 0;
        border-left: none;
        border-top: 1px solid #ecf0f1;
        text-align: center;
        font-size: 0.85rem;
    }
}

@media (max-width: 480px) {
    .novel-list {
        padding: 1rem;
    }
    
    .novel-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
    }

    .page-btn {
        min-width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }
}
</style>
