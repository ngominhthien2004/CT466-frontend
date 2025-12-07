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
        },
        sortOptions: {
            type: Object,
            default: null
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

 
</style>
