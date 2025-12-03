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
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.delete-modal {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    overflow: hidden;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    padding: 2rem;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.modal-header i {
    font-size: 2rem;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.modal-body {
    padding: 2rem;
}

.message {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.05rem;
    line-height: 1.6;
}

.item-name {
    margin: 1rem 0;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-left: 4px solid #c9a9a6;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    color: #2c3e50;
}

.warning {
    margin: 1rem 0 0 0;
    color: #e74c3c;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.warning::before {
    content: '⚠️';
}

.modal-footer {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-cancel {
    background: white;
    color: #7f8c8d;
    border: 2px solid #dfe6e9;
}

.btn-cancel:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #bdc3c7;
    transform: translateY(-2px);
}

.btn-delete {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-delete:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

/* Responsive */
@media (max-width: 576px) {
    .delete-modal {
        width: 95%;
    }
    
    .modal-header {
        padding: 1.5rem;
    }
    
    .modal-header h3 {
        font-size: 1.25rem;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-footer {
        padding: 1rem 1.5rem;
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
