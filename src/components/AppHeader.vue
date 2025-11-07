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
                    <router-link to="/admin" class="nav-link" active-class="active">
                        <i class="fas fa-cog"></i>
                        Quản lý
                    </router-link>
                </nav>

                <div class="user-actions">
                    <router-link to="/novels/add" class="btn-add-novel">
                        <i class="fas fa-plus"></i>
                        Thêm truyện
                    </router-link>
                    
                    <div v-if="isLoggedIn" class="user-menu">
                        <img :src="getUserAvatar()" 
                             :alt="user?.username" 
                             class="user-avatar" 
                             @error="handleAvatarError" />
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
        getUserAvatar() {
            if (!this.user) return '/assets/default-avatar.svg';
            
            // Nếu avatar là URL đầy đủ (http/https)
            if (this.user.avatar && (this.user.avatar.startsWith('http://') || this.user.avatar.startsWith('https://'))) {
                return this.user.avatar;
            }
            
            // Nếu có userId, dùng đường dẫn theo userId
            if (this.user._id || this.user.id) {
                const userId = this.user._id || this.user.id;
                return this.user.avatar 
                    ? `/assets/user/${userId}/${this.user.avatar}`
                    : `/assets/user/${userId}/avatar.png`;
            }
            
            // Fallback
            return '/assets/default-avatar.svg';
        },
        handleAvatarError(event) {
            // Nếu ảnh lỗi, dùng ảnh mặc định
            event.target.src = '/assets/default-avatar.svg';
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

.user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-add-novel {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
}

.btn-add-novel:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
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
    transition: background 0.3s ease;
}

.user-menu:hover {
    background: rgba(255, 255, 255, 0.3);
}

.user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 2px solid white;
    object-fit: cover;
}

.user-name {
    color: #2c3e50;
    font-weight: 500;
}

.user-menu:hover .dropdown {
    display: block;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    overflow: hidden;
    z-index: 1000;
}

/* Mở rộng vùng hover */
.dropdown::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1.25rem;
    color: #2c3e50;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    width: 100%;
    text-align: left;
    background: none;
    cursor: pointer;
    font-size: 0.95rem;
}

.dropdown-item:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.dropdown-item:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.dropdown-item:hover {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding-left: 1.5rem;
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
