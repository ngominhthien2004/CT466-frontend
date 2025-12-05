<template>
    <div class="register-page">
        <div class="register-container">
            <div class="register-card">
                <div class="card-header">
                    <h1>
                        <i class="fas fa-user-plus"></i>
                        Đăng ký tài khoản
                    </h1>
                    <p>Tham gia cộng đồng đọc tiểu thuyết NovelMT</p>
                </div>

                <form @submit.prevent="handleRegister" class="register-form">
                    <!-- Username -->
                    <div class="form-group">
                        <label for="username">
                            <i class="fas fa-user"></i>
                            Tên đăng nhập <span class="required">*</span>
                        </label>
                        <input
                            id="username"
                            v-model="formData.username"
                            type="text"
                            placeholder="Tên đăng nhập (3-20 ký tự)..."
                            required
                            :disabled="loading"
                        />
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope"></i>
                            Email <span class="required">*</span>
                        </label>
                        <input
                            id="email"
                            v-model="formData.email"
                            type="email"
                            placeholder="email@example.com"
                            required
                            :disabled="loading"
                        />
                    </div>

                    <!-- Password -->
                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            Mật khẩu <span class="required">*</span>
                        </label>
                        <div class="password-input">
                            <input
                                id="password"
                                v-model="formData.password"
                                :type="showPassword ? 'text' : 'password'"
                                placeholder="Mật khẩu (tối thiểu 6 ký tự)..."
                                required
                                :disabled="loading"
                            />
                            <button
                                type="button"
                                class="toggle-password"
                                @click="showPassword = !showPassword"
                            >
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div class="form-group">
                        <label for="confirmPassword">
                            <i class="fas fa-lock"></i>
                            Xác nhận mật khẩu <span class="required">*</span>
                        </label>
                        <div class="password-input">
                            <input
                                id="confirmPassword"
                                v-model="confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                placeholder="Nhập lại mật khẩu..."
                                required
                                :disabled="loading"
                            />
                            <button
                                type="button"
                                class="toggle-password"
                                @click="showConfirmPassword = !showConfirmPassword"
                            >
                                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Full Name (Optional) -->
                    <div class="form-group">
                        <label for="fullName">
                            <i class="fas fa-id-card"></i>
                            Họ và tên
                        </label>
                        <input
                            id="fullName"
                            v-model="formData.fullName"
                            type="text"
                            placeholder="Họ và tên của bạn (tùy chọn)..."
                            :disabled="loading"
                        />
                    </div>

                    <!-- Terms -->
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input v-model="agreedToTerms" type="checkbox" required />
                            <span>
                                Tôi đồng ý với
                                <a href="#" @click.prevent>Điều khoản sử dụng</a>
                                và
                                <a href="#" @click.prevent>Chính sách bảo mật</a>
                            </span>
                        </label>
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ error }}
                    </div>

                    <!-- Success Message -->
                    <div v-if="success" class="success-message">
                        <i class="fas fa-check-circle"></i>
                        {{ success }}
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="btn-submit" :disabled="loading || !agreedToTerms">
                        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-user-plus"></i>
                        {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
                    </button>
                </form>

                <div class="card-footer">
                    <p>
                        Đã có tài khoản?
                        <router-link to="/login">Đăng nhập ngay</router-link>
                    </p>
                    <router-link to="/" class="back-home">
                        <i class="fas fa-home"></i>
                        Về trang chủ
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '@/services/auth.service';
import { useAuthStore } from '@/stores';

export default {
    name: 'Register',
    data() {
        return {
            authStore: useAuthStore(),
            formData: {
                username: '',
                email: '',
                password: '',
                fullName: ''
            },
            confirmPassword: '',
            showPassword: false,
            showConfirmPassword: false,
            agreedToTerms: false,
            loading: false,
            error: null,
            success: null
        };
    },
    methods: {
        validateForm() {
            // Validate username
            if (this.formData.username.length < 3 || this.formData.username.length > 20) {
                this.error = 'Tên đăng nhập phải từ 3-20 ký tự';
                return false;
            }

            // Validate password
            if (this.formData.password.length < 6) {
                this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
                return false;
            }

            // Check password match
            if (this.formData.password !== this.confirmPassword) {
                this.error = 'Mật khẩu xác nhận không khớp';
                return false;
            }

            return true;
        },

        async handleRegister() {
            this.error = null;
            this.success = null;

            // Validate form
            if (!this.validateForm()) {
                return;
            }

            this.loading = true;

            try {
                // Call API register
                const response = await AuthService.register(this.formData);
                
                // Check if response has user and token
                if (response && response.user && response.token) {
                    // Auto login sau khi register thành công
                    this.authStore.login({
                        ...response.user,
                        token: response.token
                    });
                    
                    this.success = 'Đăng ký thành công! Đang chuyển đến trang chủ...';
                    
                    setTimeout(() => {
                        this.$router.push('/');
                    }, 1500);
                } else {
                    // Fallback: redirect to login nếu không có token
                    this.success = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 2000);
                }

            } catch (error) {
                console.error('Register error:', error);
                this.error = error.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.';
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.register-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.register-container {
    width: 100%;
    max-width: 550px;
}

.register-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideIn 0.4s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 2.5rem 2rem;
    text-align: center;
}

.card-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.card-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
}

.register-form {
    padding: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.required {
    color: #e74c3c;
}

.form-group input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #dfe6e9;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
}

.form-group input:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 4px rgba(201, 169, 166, 0.1);
}

.form-group input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
}

.password-input {
    position: relative;
}

.toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.3s;
}

.toggle-password:hover {
    color: #c9a9a6;
}

.checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
    color: #2c3e50;
    font-size: 0.9rem;
}

.checkbox-label input {
    margin-top: 0.25rem;
    cursor: pointer;
}

.checkbox-label a {
    color: #c9a9a6;
    text-decoration: none;
    font-weight: 600;
}

.checkbox-label a:hover {
    text-decoration: underline;
}

.error-message {
    background: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.success-message {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.btn-submit {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.4);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.card-footer {
    background: #f8f9fa;
    padding: 1.5rem 2rem;
    text-align: center;
}

.card-footer p {
    margin: 0 0 1rem 0;
    color: #7f8c8d;
}

.card-footer a {
    color: #c9a9a6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.card-footer a:hover {
    color: #b8a39e;
}

.back-home {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #7f8c8d !important;
    font-weight: 500 !important;
}

/* Responsive */
@media (max-width: 576px) {
    .register-page {
        padding: 1rem;
    }

    .card-header {
        padding: 2rem 1.5rem;
    }

    .card-header h1 {
        font-size: 1.5rem;
    }

    .register-form {
        padding: 1.5rem;
    }
}
</style>
