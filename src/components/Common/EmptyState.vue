<template>
    <div class="empty-state">
        <i :class="['fas', icon]"></i>
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'EmptyState',
    props: {
        icon: {
            type: String,
            default: 'fa-inbox'
        },
        title: {
            type: String,
            default: 'Không có dữ liệu'
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>

<style scoped>
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
}

.empty-state i {
    font-size: 4rem;
    color: #bdc3c7;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.5rem;
}

.empty-state p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
    font-size: 1rem;
}
</style>
