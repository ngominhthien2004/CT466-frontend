<template>
    <div class="form-overlay" @click.self="$emit('close')">
        <div class="form-container">
            <div class="form-header">
                <h2>
                    <i class="fas fa-user-edit"></i>
                    Chỉnh sửa User
                </h2>
                <button @click="$emit('close')" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="form-body">
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">Username:</span>
                        <span class="info-value">{{ user.username }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ user.email }}</span>
                    </div>
                    <div class="info-row" v-if="user.fullName">
                        <span class="info-label">Họ và tên:</span>
                        <span class="info-value">{{ user.fullName }}</span>
                    </div>
                </div>

                <div class="form-divider"></div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="user-role">Vai trò</label>
                        <select id="user-role" name="role" v-model="form.role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="user-status">Trạng thái</label>
                        <div class="switch-container">
                            <label class="switch">
                                <input id="user-status" name="isActive" v-model="form.isActive" type="checkbox" />
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">
                                {{ form.isActive ? 'Hoạt động' : 'Ngưng hoạt động' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" @click="$emit('close')" class="btn-cancel">
                        <i class="fas fa-times"></i>
                        Hủy
                    </button>
                    <button type="submit" class="btn-submit" :disabled="submitting">
                        <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserForm',
    props: {
        user: {
            type: Object,
            required: true
        },
        submitting: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            form: {
                role: 'user',
                isActive: true
            }
        };
    },
    mounted() {
        this.form = {
            role: this.user.role || 'user',
            isActive: this.user.isActive !== undefined ? this.user.isActive : true
        };
    },
    methods: {
        handleSubmit() {
            this.$emit('submit', this.form);
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

/* Custom modal header styling */
.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.btn-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.btn-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

/* Custom info section styling */
.info-section {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 600;
    color: #7f8c8d;
    font-size: 0.9rem;
}

.info-value {
    color: #2c3e50;
    font-weight: 500;
}

.form-divider {
    height: 2px;
    background: linear-gradient(90deg, transparent, #e9ecef, transparent);
    margin: 1.5rem 0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

/* Form group styling */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

/* Switch styling */
.switch-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
}

.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 26px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #667eea;
}

input:checked + .slider:before {
    transform: translateX(24px);
}

.switch-label {
    font-weight: 500;
    color: #2c3e50;
}

/* Modal footer and button styles moved to modals.css and buttons.css */

/* Button styling moved to global `src/assets/buttons.css` (.btn-submit, .btn-primary, etc.) */

/* Responsive */
@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .modal-header {
        padding: 1rem 1.5rem;
    }

    .modal-header h2 {
        font-size: 1.25rem;
    }

    .modal-body {
        padding: 1.5rem;
    }
}
</style>
