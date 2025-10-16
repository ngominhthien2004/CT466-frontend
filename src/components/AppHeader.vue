<template>
    <header class="app-header">
        <div class="container">
            <div class="header-content">
                <router-link to="/" class="logo">
                    <h1>NovelMT</h1>
                </router-link>

                <nav class="nav-menu">
                    <router-link to="/" class="nav-link" active-class="active">
                        Trang chủ
                    </router-link>
                    <router-link to="/favorites" class="nav-link" active-class="active">
                        Yêu thích
                    </router-link>
                    <router-link to="/history" class="nav-link" active-class="active">
                        Lịch sử
                    </router-link>
                    <router-link to="/categories" class="nav-link" active-class="active">
                        Thể loại
                    </router-link>
                </nav>

                <div class="user-actions">
                    <div v-if="isLoggedIn" class="user-menu">
                        <img :src="user?.avatar || '/default-avatar.png'" 
                             :alt="user?.username" 
                             class="user-avatar" />
                        <span class="user-name">{{ user?.username }}</span>
                        <div class="dropdown">
                            <router-link to="/profile" class="dropdown-item">
                                Trang cá nhân
                            </router-link>
                            <button @click="handleLogout" class="dropdown-item">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                    <div v-else class="auth-buttons">
                        <router-link to="/login" class="btn-login">Đăng nhập</router-link>
                        <router-link to="/register" class="btn-register">Đăng ký</router-link>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
import { AuthService } from '@/services';

export default {
    name: 'AppHeader',
    data() {
        return {
            user: null,
            isLoggedIn: false
        };
    },
    mounted() {
        this.checkAuth();
    },
    methods: {
        checkAuth() {
            this.isLoggedIn = AuthService.isLoggedIn();
            if (this.isLoggedIn) {
                this.user = AuthService.getUser();
            }
        },
        handleLogout() {
            AuthService.logout();
            this.isLoggedIn = false;
            this.user = null;
            this.$router.push('/');
        }
    }
};
</script>

<style scoped>
.app-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 1rem 0;
}

.container {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
}

.logo {
    text-decoration: none;
}

.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: #2c3e50;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
    background-color: rgba(255, 255, 255, 0.3);
}

.user-menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 2px solid white;
}

.user-name {
    color: #2c3e50;
    font-weight: 500;
}

.user-menu:hover .dropdown {
    display: block;
}

.dropdown {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 180px;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    color: #2c3e50;
    text-decoration: none;
    transition: background 0.2s;
    border: none;
    width: 100%;
    text-align: left;
    background: none;
    cursor: pointer;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.btn-login,
.btn-register {
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
}

.btn-login {
    color: #2c3e50;
    background: rgba(255, 255, 255, 0.3);
}

.btn-register {
    color: white;
    background: #2c3e50;
}
</style>
