<template>
    <div v-if="show" class="form-overlay" @click="$emit('close')">
        <div class="form-container" @click.stop>
            <div class="form-header">
                <h3>
                    <i class="fas fa-key"></i>
                    Đổi mật khẩu
                </h3>
                <button @click="$emit('close')" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form @submit.prevent="handleSubmit" class="form-body">
                <div v-if="error" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ error }}
                </div>
                <div class="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <div class="password-input-wrapper">
                        <input
                            v-model="passwords.currentPassword"
                            :type="showCurrentPassword ? 'text' : 'password'"
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                        />
                        <button 
                            type="button" 
                            class="btn-toggle-password"
                            @click="showCurrentPassword = !showCurrentPassword"
                        >
                            <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <div class="password-input-wrapper">
                        <input
                            v-model="passwords.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            placeholder="Nhập mật khẩu mới"
                            required
                            minlength="8"
                        />
                        <button 
                            type="button" 
                            class="btn-toggle-password"
                            @click="showNewPassword = !showNewPassword"
                        >
                            <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <small class="password-hint">
                        Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
                    </small>
                </div>
                <div class="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <div class="password-input-wrapper">
                        <input
                            v-model="passwords.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="Nhập lại mật khẩu mới"
                            required
                        />
                        <button 
                            type="button" 
                            class="btn-toggle-password"
                            @click="showConfirmPassword = !showConfirmPassword"
                        >
                            <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" @click="$emit('close')" class="btn-cancel">
                        <i class="fas fa-times"></i>
                        Hủy
                    </button>
                    <button type="submit" class="btn-submit" :disabled="submitting">
                        <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                        {{ submitting ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChangePasswordModal',
    props: {
        show: { type: Boolean, required: true },
        error: { type: String, default: '' },
        submitting: { type: Boolean, default: false }
    },
    emits: ['close', 'submit'],
    data() {
        return {
            passwords: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false
        };
    },
    watch: {
        show(newVal) {
            if (!newVal) {
                this.resetForm();
            }
        }
    },
    methods: {
        handleSubmit() {
            this.$emit('submit', { ...this.passwords });
        },
        resetForm() {
            this.passwords = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showCurrentPassword = false;
            this.showNewPassword = false;
            this.showConfirmPassword = false;
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

.error-message {
    background: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.error-message i {
    font-size: 1.1rem;
}

.password-input-wrapper {
    position: relative;
}

.password-input-wrapper input {
    padding-right: 3rem;
}

.btn-toggle-password {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.3s;
}

.btn-toggle-password:hover {
    color: #c9a9a6;
}

.password-hint {
    display: block;
    font-size: 0.85rem;
    color: #7f8c8d;
    margin-top: 0.5rem;
}
</style>
