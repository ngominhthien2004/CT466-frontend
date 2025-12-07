<template>
    <div class="dashboard">
        <PageHeader
            title="Tổng quan"
            subtitle="Theo dõi thống kê và hoạt động của hệ thống"
            icon="fas fa-chart-line"
        />

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card" v-for="stat in computedStats" :key="stat.title">
                <div class="stat-icon" :style="{ background: stat.color }">
                    <i :class="stat.icon"></i>
                </div>
                <div class="stat-content">
                    <h3>{{ stat.title }}</h3>
                    <div class="stat-value">
                        <span class="number">{{ formatNumber(stat.value) }}</span>
                        <span v-if="stat.change" :class="['change', stat.changeType]">
                            <i :class="stat.changeType === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                            {{ stat.change }}%
                        </span>
                    </div>
                    <p class="stat-label">{{ stat.label }}</p>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
            <!-- Recent Activity -->
            <div class="card activity-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-clock"></i>
                        Hoạt động gần đây
                    </h3>
                </div>
                <div class="card-body">
                    <div v-if="loading" class="loading">
                        <div class="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                    <div v-else-if="recentNovels.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                    <div v-else class="activity-list">
                        <div v-for="novel in recentNovels" :key="novel._id" class="activity-item">
                            <img :src="novel.coverImage || '/assets/default-book.png'" :alt="novel.title" />
                            <div class="activity-info">
                                <h4>{{ novel.title }}</h4>
                                <p>{{ novel.author }}</p>
                                <span class="activity-meta">
                                    <i class="fas fa-eye"></i> {{ formatNumber(novel.views || 0) }} lượt xem
                                </span>
                            </div>
                            <a :href="`/novels/${novel._id}`" class="btn-view">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Novels -->
            <div class="card top-novels-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-star"></i>
                        Top Tiểu thuyết phổ biến
                    </h3>
                </div>
                <div class="card-body">
                    <div v-if="loading" class="loading">
                        <div class="spinner"></div>
                    </div>
                    <div v-else-if="topNovels.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có dữ liệu</p>
                    </div>
                    <div v-else class="top-list">
                        <div v-for="(novel, index) in topNovels" :key="novel._id" class="top-item">
                            <span class="rank" :class="getRankClass(index)">{{ index + 1 }}</span>
                            <div class="top-info">
                                <h4>{{ novel.title }}</h4>
                                <div class="top-stats">
                                    <span><i class="fas fa-eye"></i> {{ formatNumber(novel.views || 0) }}</span>
                                    <span><i class="fas fa-heart"></i> {{ formatNumber(novel.likes || 0) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
    </div>
</template>

<script>
import { useNovelStore } from '@/stores';
import PageHeader from '@/components/Admin/PageHeader.vue';

export default {
    name: 'Dashboard',
    components: { PageHeader },
    data() {
        return {
            novelStore: useNovelStore(),
            stats: [
                {
                    title: 'Tổng Tiểu thuyết',
                    label: 'Tiểu thuyết',
                    icon: 'fas fa-book',
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    change: null,
                    changeType: 'up'
                },
                {
                    title: 'Tổng Lượt xem',
                    label: 'Lượt xem',
                    icon: 'fas fa-eye',
                    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    change: null,
                    changeType: 'up'
                }
            ]
        };
    },
    computed: {
        // Lấy data từ store thay vì local state
        loading() {
            return this.novelStore.loading;
        },
        recentNovels() {
            return this.novelStore.recentNovels.slice(0, 5);
        },
        topNovels() {
            return this.novelStore.popularNovels.slice(0, 5);
        },
        // Stats tự động cập nhật khi store thay đổi
        computedStats() {
            const stats = [...this.stats];
            stats[0].value = this.novelStore.totalNovels;
            stats[1].value = this.novelStore.totalViews;
            return stats;
        }
    },
    async mounted() {
        await this.novelStore.fetchNovels();
    },
    methods: {
        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },
        getRankClass(index) {
            if (index === 0) return 'gold';
            if (index === 1) return 'silver';
            if (index === 2) return 'bronze';
            return '';
        },
        async refreshData() {
            await this.novelStore.fetchNovels();
        }
    }
};
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1.5rem;
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
}

.stat-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #7f8c8d;
    font-weight: 500;
}

.stat-value {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.stat-value .number {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
}

.change {
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
}

.change.up {
    background: #d4edda;
    color: #155724;
}

.change.down {
    background: #f8d7da;
    color: #721c24;
}

.stat-label {
    margin: 0;
    font-size: 0.85rem;
    color: #95a5a6;
}

/* Charts Row */
.charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #ecf0f1;
}

.card-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.card-body {
    padding: 1.5rem;
}

/* Loading & Empty State */
.loading {
    text-align: center;
    padding: 2rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #c9a9a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}



/* Activity List */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: #f8f9fa;
    transition: all 0.3s;
}

.activity-item:hover {
    background: #ecf0f1;
}

.activity-item img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
}

.activity-info {
    flex: 1;
}

.activity-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    color: #2c3e50;
}

.activity-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.activity-meta {
    font-size: 0.8rem;
    color: #95a5a6;
}

.btn-view {
    background: #c9a9a6;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-view:hover {
    background: #b8a39e;
    transform: scale(1.1);
}

/* Top List */
.top-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.top-item {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    background: #f8f9fa;
}

.rank {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: #95a5a6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
}

.rank.gold {
    background: linear-gradient(135deg, #f9d423 0%, #ff4e50 100%);
}

.rank.silver {
    background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
}

.rank.bronze {
    background: linear-gradient(135deg, #d38312 0%, #a83279 100%);
}

.top-info {
    flex: 1;
}

.top-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: #2c3e50;
}

.top-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #7f8c8d;
}

/* Responsive */
@media (max-width: 1024px) {
    .charts-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
