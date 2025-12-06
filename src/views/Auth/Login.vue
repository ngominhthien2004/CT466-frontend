<template>
    <div class="login-page">
        <div class="login-container">
            <div class="login-card">
                <div class="card-header">
                    <h1>
                        <i class="fas fa-book"></i>
                        Đăng nhập NovelMT
                    </h1>
                    <p>Chào mừng bạn quay trở lại!</p>
                </div>

                <form @submit.prevent="handleLogin" class="login-form">
                    <!-- Email -->
                    <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope"></i>
                            Email
                        </label>
                        <input
                            id="email"
                            v-model="formData.email"
                            type="email"
                            placeholder="Nhập email của bạn..."
                            required
                            :disabled="loading"
                        />
                    </div>

                    <!-- Password -->
                    <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock"></i>
                            Mật khẩu
                        </label>
                        <div class="password-input">
                            <input
                                id="password"
                                v-model="formData.password"
                                :type="showPassword ? 'text' : 'password'"
                                placeholder="Nhập mật khẩu..."
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

                    <!-- Remember Me -->
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input v-model="rememberMe" type="checkbox" />
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                        <a href="#" class="forgot-password">Quên mật khẩu?</a>
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ error }}
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="btn-submit" :disabled="loading">
                        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-sign-in-alt"></i>
                        {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                    </button>
                </form>

                <div class="card-footer">
                    <p>
                        Chưa có tài khoản?
                        <router-link to="/register">Đăng ký ngay</router-link>
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
    name: 'Login',
    data() {
        return {
            authStore: useAuthStore(),
            formData: {
                email: '',
                password: ''
            },
            showPassword: false,
            rememberMe: false,
            loading: false,
            error: null
        };
    },
    mounted() {
        // Load remembered credentials
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        
        if (rememberedEmail && rememberedPassword) {
            this.formData.email = rememberedEmail;
            this.formData.password = atob(rememberedPassword); // Decode base64
            this.rememberMe = true;
        }
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.error = null;

            try {
                // Call API login
                const response = await AuthService.login(this.formData);
                
                console.log('Login response:', response);
                
                // Check if response has user and token
                if (!response || !response.user || !response.token) {
                    throw new Error('Invalid response from server');
                }
                
                // Lưu user + token vào store
                this.authStore.login({
                    ...response.user,
                    token: response.token
                });

                // Xử lý remember me
                if (this.rememberMe) {
                    localStorage.setItem('rememberedEmail', this.formData.email);
                    localStorage.setItem('rememberedPassword', btoa(this.formData.password)); // Encode base64
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                // Redirect về trang trước hoặc home
                const redirect = this.$route.query.redirect || '/';
                this.$router.push(redirect);

            } catch (error) {
                console.error('Login error:', error);
                console.error('Error response:', error.response);
                this.error = error.response?.data?.message || error.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.';
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.login-container {
    width: 100%;
    max-width: 450px;
}

.login-card {
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

.login-form {
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

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #2c3e50;
    font-size: 0.9rem;
}

.checkbox-label input {
    cursor: pointer;
}

.forgot-password {
    color: #c9a9a6;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.3s;
}

.forgot-password:hover {
    color: #b8a39e;
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
    margin: 0 0 0.75rem 0;
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
    margin: 0;
}

/* Responsive */
@media (max-width: 576px) {
    .login-page {
        padding: 1rem;
    }

    .card-header {
        padding: 2rem 1.5rem;
    }

    .card-header h1 {
        font-size: 1.5rem;
    }

    .login-form {
        padding: 1.5rem;
    }

    .form-options {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
}
</style>
