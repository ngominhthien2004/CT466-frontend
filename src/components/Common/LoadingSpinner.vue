<template>
    <div class="loading-container">
        <div class="spinner"></div>
        <p v-if="message">{{ message }}</p>
    </div>
</template>

<script>
export default {
    name: 'LoadingSpinner',
    props: {
        message: {
            type: String,
            default: 'Đang tải dữ liệu...'
        }
    }
};
</script>

<style scoped>
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
}

.spinner {
    width: 50px;
    height: 50px;
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

.loading-container p {
    color: #7f8c8d;
    font-size: 1rem;
    margin: 0;
}
</style>
