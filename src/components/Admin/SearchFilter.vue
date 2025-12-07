<template>
    <div class="filters-section">
        <div class="filter-group">
            <!-- Search Box -->
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    :value="modelValue"
                    @input="$emit('update:modelValue', $event.target.value)"
                    type="text"
                    :placeholder="placeholder"
                />
            </div>

            <!-- Custom Filters Slot -->
            <slot></slot>

            <!-- Reset Button -->
            <button v-if="showReset" @click="$emit('reset')" class="btn-reset">
                <i class="fas fa-redo"></i>
                Reset
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SearchFilter',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Tìm kiếm...'
        },
        showReset: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue', 'reset']
};
</script>

<style scoped>
.filters-section {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .filter-group {
        flex-direction: column;
    }

    .search-box {
        min-width: 100%;
    }
}
</style>
