<template>
    <div class="stats-cards">
        <div v-for="(stat, index) in stats" :key="index" class="stat-card">
            <div class="stat-icon" :class="stat.color">
                <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
                <h3>{{ stat.value }}</h3>
                <p>{{ stat.label }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StatsCards',
    props: {
        stats: {
            type: Array,
            required: true,
        }
    }
};
</script>

<style scoped>
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.red { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-icon.purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.cyan { background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%); }

.stat-info h3 {
    margin: 0;
    font-size: 2rem;
    color: #2c3e50;
}

.stat-info p {
    margin: 0.25rem 0 0 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .stats-cards {
        grid-template-columns: 1fr;
    }
}
</style>
