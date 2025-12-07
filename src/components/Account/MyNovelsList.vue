<template>
    <div class="novels-section">
        <div class="section-header">
            <h3>
                <i class="fas fa-book"></i>
                Tiểu thuyết đã đăng
            </h3>
            <router-link to="/novels/add" class="btn-add">
                <i class="fas fa-plus"></i>
                Thêm tiểu thuyết mới
            </router-link>
        </div>

        <!-- Search & Filter -->
        <div class="filters-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Tìm kiếm tiểu thuyết..."
                    @input="$emit('filter', { search: searchQuery, status: statusFilter })"
                />
            </div>
            <select 
                v-model="statusFilter" 
                @change="$emit('filter', { search: searchQuery, status: statusFilter })" 
                class="filter-select"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="ongoing">Đang ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="paused">Tạm dừng</option>
            </select>
        </div>

        <!-- Empty State -->
        <div v-if="novels.length === 0" class="empty-state">
            <i class="fas fa-book-open"></i>
            <p v-if="totalNovels === 0">Bạn chưa đăng tiểu thuyết nào</p>
            <p v-else>Không tìm thấy kết quả phù hợp</p>
        </div>

        <!-- Novels List -->
        <div v-else class="novels-list">
            <div v-for="novel in novels" :key="novel._id" class="novel-item">
                <img
                    :src="novel.coverImage || '/assets/default-book.png'"
                    :alt="novel.title"
                    class="novel-cover"
                />
                <div class="novel-info">
                    <div class="novel-header">
                        <router-link :to="`/novels/${novel._id}`" class="novel-title">
                            {{ novel.title }}
                        </router-link>
                        <span class="status-badge" :class="novel.status">
                            {{ getStatusText(novel.status) }}
                        </span>
                    </div>
                    <p class="novel-author">
                        <i class="fas fa-user"></i>
                        {{ novel.author || 'Chưa rõ' }}
                    </p>
                    <div class="novel-genres">
                        <span v-for="genre in novel.genres?.slice(0, 5)" :key="genre" class="genre-tag">
                            {{ genre }}
                        </span>
                    </div>
                    <div class="novel-stats">
                        <span><i class="fas fa-eye"></i> {{ formatNumber(novel.views || 0) }}</span>
                        <span><i class="fas fa-heart"></i> {{ formatNumber(novel.likes || 0) }}</span>
                        <span><i class="fas fa-book"></i> {{ novel.chapterCount || 0 }} chương</span>
                    </div>
                </div>
                <div class="novel-actions">
                    <router-link :to="`/novels/${novel._id}`" class="btn-action btn-view" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </router-link>
                    <button @click="$emit('edit', novel)" class="btn-action btn-edit" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button @click="$emit('delete', novel)" class="btn-action btn-delete" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MyNovelsList',
    props: {
        novels: { type: Array, required: true },
        totalNovels: { type: Number, default: 0 }
    },
    emits: ['filter', 'edit', 'delete'],
    data() {
        return {
            searchQuery: '',
            statusFilter: ''
        };
    },
    methods: {
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },
        getStatusText(status) {
            const statusMap = {
                'ongoing': 'Đang ra',
                'completed': 'Hoàn thành',
                'paused': 'Tạm dừng'
            };
            return statusMap[status] || status;
        }
    }
};
</script>

<style scoped>
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}


.filters-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.novels-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.novel-item {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;
}

.novel-item:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.novel-cover {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.novel-info {
    flex: 1;
}

.novel-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.novel-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    text-decoration: none;
}

.novel-title:hover {
    color: #c9a9a6;
}


.novel-author {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.novel-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.genre-tag {
    padding: 0.25rem 0.75rem;
    background: white;
    border: 1px solid #dfe6e9;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.novel-stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: #95a5a6;
}

.novel-stats span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.novel-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}


@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .filters-section {
        flex-direction: column;
    }

    .novel-item {
        flex-direction: column;
    }

    .novel-cover {
        width: 100%;
        height: 200px;
    }

    .novel-actions {
        flex-direction: row;
    }
}
</style>
