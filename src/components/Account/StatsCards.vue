<template>
    <div class="stats-grid">
        <div class="stat-card">
            <i class="fas fa-heart"></i>
            <div class="stat-info">
                <span class="stat-value">{{ stats.favorites }}</span>
                <span class="stat-label">Yêu thích</span>
            </div>
        </div>
        <div class="stat-card">
            <i class="fas fa-history"></i>
            <div class="stat-info">
                <span class="stat-value">{{ stats.reading }}</span>
                <span class="stat-label">Đang đọc</span>
            </div>
        </div>
        <div class="stat-card">
            <i class="fas fa-book"></i>
            <div class="stat-info">
                <span class="stat-value">{{ stats.novels }}</span>
                <span class="stat-label">Đã đăng</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StatsCards',
    props: {
        stats: {
            type: Object,
            default: () => ({
                favorites: 0,
                reading: 0,
                novels: 0
            })
        }
    }
};
</script>

<style scoped>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.4);
}

.stat-card > i {
    font-size: 2.5rem;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 0.25rem;
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
