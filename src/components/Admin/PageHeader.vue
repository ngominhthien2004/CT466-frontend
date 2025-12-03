<template>
    <div class="page-header">
        <div class="header-content">
            <h1>
                <i :class="icon"></i>
                {{ title }}
            </h1>
            <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <slot name="actions"></slot>
    </div>
</template>

<script>
export default {
    name: 'PageHeader',
    props: {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: 'fas fa-cog'
        }
    }
};
</script>

<style scoped>
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content h1 {
    color: white;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
}

.header-content p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>
