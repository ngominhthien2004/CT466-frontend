<template>
    <div class="callback-page">
        <div class="callback-container">
            <div class="spinner"></div>
            <h2>Đang xử lý đăng nhập...</h2>
            <p>Vui lòng đợi trong giây lát</p>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores';

export default {
    name: 'GoogleCallback',
    mounted() {
        this.handleCallback();
    },
    methods: {
        handleCallback() {
            const authStore = useAuthStore();
            const urlParams = new URLSearchParams(window.location.search);
            
            const token = urlParams.get('token');
            const userStr = urlParams.get('user');
            const error = urlParams.get('error');

            if (error) {
                console.error('Google OAuth error:', error);
                this.$router.push({
                    path: '/login',
                    query: { error: 'Đăng nhập Google thất bại! Vui lòng thử lại.' }
                });
                return;
            }

            if (token && userStr) {
                try {
                    const user = JSON.parse(decodeURIComponent(userStr));
                    
                    // Save to store
                    authStore.login({
                        ...user,
                        token: token
                    });

                    // Redirect to home
                    setTimeout(() => {
                        this.$router.push('/');
                    }, 500);
                } catch (error) {
                    console.error('Parse user data error:', error);
                    this.$router.push({
                        path: '/login',
                        query: { error: 'Đăng nhập thất bại! Vui lòng thử lại.' }
                    });
                }
            } else {
                this.$router.push({
                    path: '/login',
                    query: { error: 'Đăng nhập thất bại! Vui lòng thử lại.' }
                });
            }
        }
    }
};
</script>

<style scoped>
.callback-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.callback-container {
    background: white;
    border-radius: 20px;
    padding: 3rem 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 400px;
}

.spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 1.5rem;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #c9a9a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

h2 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
}

p {
    color: #7f8c8d;
    margin: 0;
}
</style>
