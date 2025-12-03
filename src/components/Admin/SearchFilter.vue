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

.search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 1rem;
    color: #7f8c8d;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-reset {
    padding: 0.75rem 1.25rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #495057;
}

.btn-reset:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
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
