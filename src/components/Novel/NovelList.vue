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
                    @toggle-favorite="handleToggleFavorite"
                />
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button 
                    class="page-btn" 
                    :disabled="currentPage === 1"
                    @click="goToPage(1)"
                    title="Trang đầu"
                >
                    <i class="fas fa-angle-double-left"></i>
                </button>
                
                <button 
                    class="page-btn" 
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                    title="Trang trước"
                >
                    <i class="fas fa-angle-left"></i>
                </button>

                <template v-for="page in visiblePages" :key="page">
                    <button 
                        v-if="page !== '...'"
                        class="page-btn"
                        :class="{ active: page === currentPage }"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </button>
                    <span v-else class="page-dots">...</span>
                </template>

                <button 
                    class="page-btn" 
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                    title="Trang sau"
                >
                    <i class="fas fa-angle-right"></i>
                </button>

                <button 
                    class="page-btn" 
                    :disabled="currentPage === totalPages"
                    @click="goToPage(totalPages)"
                    title="Trang cuối"
                >
                    <i class="fas fa-angle-double-right"></i>
                </button>

                <div class="page-info">
                    Trang {{ currentPage }} / {{ totalPages }} (Tổng {{ novels.length }})
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import NovelCard from './NovelCard.vue';

export default {
    name: 'NovelList',
    components: {
        NovelCard
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
            currentPage: 1
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
        },
        visiblePages() {
            const pages = [];
            const total = this.totalPages;
            const current = this.currentPage;
            
            if (total <= 7) {
                // Hiển thị tất cả nếu <= 7 trang
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                // Luôn hiển thị trang đầu
                pages.push(1);
                
                if (current > 3) {
                    pages.push('...');
                }
                
                // Hiển thị các trang xung quanh trang hiện tại
                for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                    pages.push(i);
                }
                
                if (current < total - 2) {
                    pages.push('...');
                }
                
                // Luôn hiển thị trang cuối
                pages.push(total);
            }
            
            return pages;
        }
    },
    watch: {
        novels() {
            // Reset về trang 1 khi danh sách novels thay đổi
            this.currentPage = 1;
        }
    },
    methods: {
        handleToggleFavorite(novelId, isFavorite) {
            this.$emit('toggle-favorite', novelId, isFavorite);
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

.loading,
.empty {
    text-align: center;
    padding: 3rem 0;
    color: #95a5a6;
}

/* Pagination Styles */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #ecf0f1;
    flex-wrap: wrap;
}

.page-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #dfe6e9;
    background: white;
    color: #2c3e50;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #c9a9a6;
    color: #c9a9a6;
    transform: translateY(-2px);
}

.page-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border-color: #c9a9a6;
    font-weight: 600;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-dots {
    padding: 0 8px;
    color: #95a5a6;
    font-weight: 600;
}

.page-info {
    margin-left: 1rem;
    color: #7f8c8d;
    font-size: 0.9rem;
    padding: 0 1rem;
    border-left: 2px solid #ecf0f1;
}

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
