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

                    <!-- Submit Button -->
                    <button type="submit" class="btn-submit" :disabled="loading">
                        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-sign-in-alt"></i>
                        {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                    </button>

                    <!-- Divider -->
                    <div class="divider">
                        <span>hoặc</span>
                    </div>

                    <!-- Google Login Button -->
                    <button type="button" class="btn-google" @click="handleGoogleLogin">
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                        Đăng nhập với Google
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
import { useAuthStore, useNotificationStore } from '@/stores';

export default {
    name: 'Login',
    data() {
        return {
            authStore: useAuthStore(),
            notifier: useNotificationStore(),
            formData: {
                email: '',
                password: ''
            },
            showPassword: false,
            rememberMe: false,
            loading: false
        };
    },
    mounted() {
        // Check for error from Google OAuth
        if (this.$route.query.error) {
            const msg = this.$route.query.error;
            this.notifier.showNotification(msg, 'error', true, 4000);
        }

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
        handleGoogleLogin() {
            // Redirect to backend Google OAuth endpoint
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            window.location.href = `${backendUrl}/api/auth/google`;
        },

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
                const msg = error.response?.data?.message || error.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.';
                // Show global notification modal for errors
                this.notifier.showNotification(msg, 'error', true, 4000);
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

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #dfe6e9;
}

.divider span {
    padding: 0 1rem;
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
