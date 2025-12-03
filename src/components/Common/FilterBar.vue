<template>
    <div class="filter-bar">
        <select
            v-if="statusOptions"
            v-model="localStatus"
            @change="handleStatusChange"
            class="filter-select"
        >
            <option value="">{{ statusOptions.placeholder || 'Tất cả trạng thái' }}</option>
            <option
                v-for="option in statusOptions.options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>
        
        <select
            v-if="sortOptions"
            v-model="localSort"
            @change="handleSortChange"
            class="filter-select"
        >
            <option
                v-for="option in sortOptions.options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>
        
        <button @click="handleReset" class="btn-reset">
            <i class="fas fa-redo"></i>
            Đặt lại
        </button>
    </div>
</template>

<script>
export default {
    name: 'FilterBar',
    props: {
        statusFilter: {
            type: String,
            default: ''
        },
        sortBy: {
            type: String,
            default: ''
        },
        statusOptions: {
            type: Object,
            default: null
            // Format: { placeholder: 'text', options: [{ value: 'val', label: 'Label' }] }
        },
        sortOptions: {
            type: Object,
            default: null
            // Format: { options: [{ value: 'val', label: 'Label' }] }
        }
    },
    data() {
        return {
            localStatus: this.statusFilter,
            localSort: this.sortBy
        };
    },
    watch: {
        statusFilter(newVal) {
            this.localStatus = newVal;
        },
        sortBy(newVal) {
            this.localSort = newVal;
        }
    },
    methods: {
        handleStatusChange() {
            this.$emit('update:statusFilter', this.localStatus);
            this.$emit('filter-change', { status: this.localStatus, sort: this.localSort });
        },
        handleSortChange() {
            this.$emit('update:sortBy', this.localSort);
            this.$emit('sort-change', this.localSort);
        },
        handleReset() {
            this.localStatus = '';
            this.localSort = this.sortOptions?.options[0]?.value || '';
            this.$emit('update:statusFilter', this.localStatus);
            this.$emit('update:sortBy', this.localSort);
            this.$emit('reset');
        }
    }
};
</script>

<style scoped>
.filter-bar {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
    color: #2c3e50;
}

.filter-select:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
}

.filter-select:hover {
    border-color: #bdc3c7;
}

.btn-reset {
    background: white;
    border: 2px solid #dfe6e9;
    color: #7f8c8d;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-reset:hover {
    background: #f8f9fa;
    border-color: #bdc3c7;
    color: #2c3e50;
}

.btn-reset i {
    transition: transform 0.3s;
}

.btn-reset:hover i {
    transform: rotate(180deg);
}

@media (max-width: 768px) {
    .filter-bar {
        width: 100%;
    }
    
    .filter-select {
        flex: 1;
        min-width: 120px;
    }
    
    .btn-reset {
        width: 100%;
        justify-content: center;
    }
}
</style>
