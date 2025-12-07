<template>
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
        <div class="delete-modal">
            <div class="modal-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>{{ title }}</h3>
            </div>
            
            <div class="modal-body">
                <p class="message">{{ message }}</p>
                <p v-if="itemName" class="item-name">{{ itemName }}</p>
                <p class="warning">{{ warningText }}</p>
            </div>
            
            <div class="modal-footer">
                <button 
                    @click="$emit('cancel')" 
                    class="btn btn-cancel"
                    :disabled="loading"
                >
                    <i class="fas fa-times"></i>
                    Hủy
                </button>
                <button 
                    @click="$emit('confirm')" 
                    class="btn btn-delete"
                    :disabled="loading"
                >
                    <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                    {{ loading ? 'Đang xóa...' : 'Xóa' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DeleteModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Xác nhận xóa'
        },
        message: {
            type: String,
            default: 'Bạn có chắc chắn muốn xóa mục này?'
        },
        itemName: {
            type: String,
            default: ''
        },
        warningText: {
            type: String,
            default: 'Hành động này không thể hoàn tác!'
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['confirm', 'cancel']
};
</script>

<style scoped>

/* Custom delete modal header gradient */
.modal-header {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
}

.modal-header i {
    color: white;
}

/* Custom item name styling */
.item-name {
    border-left: 4px solid #c9a9a6;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Custom warning styling */
.warning {
    color: #e74c3c;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.warning::before {
    content: '⚠️';
}

/* Responsive */
@media (max-width: 576px) {
    .modal-header h3 {
        font-size: 1.25rem;
    }
}
</style>
