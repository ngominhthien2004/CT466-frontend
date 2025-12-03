<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="show" class="modal-overlay" @click="handleCancel">
                <div class="modal-container" @click.stop>
                    <div class="modal-header">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>{{ title }}</h3>
                    </div>
                    <div class="modal-body">
                        <p>{{ message }}</p>
                    </div>
                    <div class="modal-footer">
                        <button @click="handleCancel" class="btn-cancel">
                            {{ cancelText }}
                        </button>
                        <button @click="handleConfirm" class="btn-confirm" :class="confirmType">
                            {{ confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
export default {
    name: 'ConfirmModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Xác nhận'
        },
        message: {
            type: String,
            required: true
        },
        confirmText: {
            type: String,
            default: 'Xác nhận'
        },
        cancelText: {
            type: String,
            default: 'Hủy'
        },
        confirmType: {
            type: String,
            default: 'danger', // danger, primary, success
            validator: (value) => ['danger', 'primary', 'success'].includes(value)
        }
    },
    emits: ['confirm', 'cancel', 'update:show'],
    methods: {
        handleConfirm() {
            this.$emit('confirm');
            this.$emit('update:show', false);
        },
        handleCancel() {
            this.$emit('cancel');
            this.$emit('update:show', false);
        }
    }
};
</script>

<style scoped>
/* Modal styles moved to modals.css */

/* Custom button confirm variants */
.btn-confirm {
    color: white;
    padding: 0.625rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-confirm.danger {
    background: #e74c3c;
}

.btn-confirm.danger:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-confirm.primary {
    background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
}

.btn-confirm.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.3);
}

.btn-confirm.success {
    background: #27ae60;
}

.btn-confirm.success:hover {
    background: #229954;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container {
    animation: slideUp 0.3s ease-out;
}

.modal-leave-active .modal-container {
    animation: slideDown 0.3s ease-in;
}

@keyframes slideDown {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(20px);
    }
}
</style>
