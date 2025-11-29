<template>
    <header class="app-header">
        <div class="container">
            <div class="header-content">
                <!-- Logo -->
                <router-link to="/" class="logo">
                    <div class="logo-icon">
                        <i class="fas fa-book-reader"></i>
                    </div>
                    <div class="logo-text">
                        <h1>NovelMT</h1>
                        <span class="logo-tagline">Đọc truyện mọi lúc</span>
                    </div>
                </router-link>

                <!-- Navigation Menu -->
                <nav class="nav-menu">
                    <router-link to="/" class="nav-link" exact-active-class="active">
                        <i class="fas fa-home"></i>
                        <span>Trang chủ</span>
                    </router-link>
                    <router-link to="/favorites" class="nav-link" active-class="active">
                        <i class="fas fa-heart"></i>
                        <span>Yêu thích</span>
                    </router-link>
                    <router-link to="/reading-history" class="nav-link" active-class="active">
                        <i class="fas fa-history"></i>
                        <span>Lịch sử</span>
                    </router-link>
                    <router-link to="/genres" class="nav-link" active-class="active">
                        <i class="fas fa-th-large"></i>
                        <span>Thể loại</span>
                    </router-link>
                    <router-link to="/admin" class="nav-link admin-link" active-class="active">
                        <i class="fas fa-cog"></i>
                        <span>Quản lý</span>
                    </router-link>
                </nav>

                <!-- User Actions -->
                <div class="user-actions">
                    <router-link to="/novels/add" class="btn-add-novel">
                        <i class="fas fa-plus-circle"></i>
                        <span>Thêm truyện</span>
                    </router-link>
                    
                    <!-- User Menu (Logged In) -->
                    <div v-if="isLoggedIn" class="user-menu">
                        <div class="user-info">
                            <img :src="getUserAvatar()" 
                                 :alt="username" 
                                 class="user-avatar" 
                                 @error="handleAvatarError" />
                            <div class="user-details">
                                <span class="user-name">{{ username }}</span>
                                <span class="user-role">{{ user?.role || 'user' }}</span>
                            </div>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </div>
                        <div class="dropdown">
                            <router-link to="/profile" class="dropdown-item">
                                <i class="fas fa-user"></i>
                                Trang cá nhân
                            </router-link>
                            <router-link to="/settings" class="dropdown-item">
                                <i class="fas fa-cog"></i>
                                Cài đặt
                            </router-link>
                            <div class="dropdown-divider"></div>
                            <button @click="handleLogout" class="dropdown-item logout">
                                <i class="fas fa-sign-out-alt"></i>
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    <!-- Auth Buttons (Not Logged In) -->
                    <div v-else class="auth-buttons">
                        <router-link to="/login" class="btn-login">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Đăng nhập</span>
                        </router-link>
                        <router-link to="/register" class="btn-register">
                            <i class="fas fa-user-plus"></i>
                            <span>Đăng ký</span>
                        </router-link>
                    </div>
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" @click="toggleMobileMenu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div class="mobile-menu" :class="{ active: mobileMenuActive }">
            <nav class="mobile-nav">
                <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-home"></i>
                    <span>Trang chủ</span>
                </router-link>
                <router-link to="/favorites" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-heart"></i>
                    <span>Yêu thích</span>
                </router-link>
                <router-link to="/reading-history" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-history"></i>
                    <span>Lịch sử</span>
                </router-link>
                <router-link to="/genres" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-th-large"></i>
                    <span>Thể loại</span>
                </router-link>
                <router-link to="/admin" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-cog"></i>
                    <span>Quản lý</span>
                </router-link>
                <div class="mobile-divider"></div>
                <router-link to="/novels/add" class="mobile-nav-link" @click="closeMobileMenu">
                    <i class="fas fa-plus-circle"></i>
                    <span>Thêm truyện</span>
                </router-link>
                <template v-if="!isLoggedIn">
                    <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Đăng nhập</span>
                    </router-link>
                    <router-link to="/register" class="mobile-nav-link" @click="closeMobileMenu">
                        <i class="fas fa-user-plus"></i>
                        <span>Đăng ký</span>
                    </router-link>
                </template>
                <template v-else>
                    <router-link to="/profile" class="mobile-nav-link" @click="closeMobileMenu">
                        <i class="fas fa-user"></i>
                        <span>Trang cá nhân</span>
                    </router-link>
                    <button @click="handleLogout" class="mobile-nav-link">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </button>
                </template>
            </nav>
        </div>
    </header>
</template>

<script>
import { useAuthStore } from '@/stores';

export default {
    name: 'AppHeader',
    data() {
        return {
            authStore: useAuthStore(),
            mobileMenuActive: false
        };
    },
    computed: {
        isLoggedIn() {
            return this.authStore.isAuthenticated;
        },
        user() {
            return this.authStore.currentUser;
        },
        username() {
            return this.authStore.username;
        }
    },
    mounted() {
        // Load user from localStorage when component mounts
        this.authStore.loadUser();
    },
    methods: {
        getUserAvatar() {
            // Use authStore's userAvatar getter which handles all cases
            return this.authStore.userAvatar;
        },
        handleAvatarError(event) {
            // Nếu ảnh lỗi, dùng ảnh mặc định
            event.target.src = '/assets/default-avatar.svg';
        },
        handleLogout() {
            this.authStore.logout();
            this.closeMobileMenu();
            this.$router.push('/');
        },
        toggleMobileMenu() {
            this.mobileMenuActive = !this.mobileMenuActive;
        },
        closeMobileMenu() {
            this.mobileMenuActive = false;
        }
    }
};
</script>

<style scoped>
/* Header */
.app-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 0;
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
    padding: 1rem 0;
    gap: 2rem;
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    transition: transform 0.3s;
}

.logo:hover {
    transform: scale(1.05);
}

.logo-icon {
    width: 50px;
    height: 50px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-icon i {
    font-size: 1.75rem;
    color: #c9a9a6;
}

.logo-text h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
}

.logo-tagline {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
    white-space: nowrap;
}

/* Navigation Menu */
.nav-menu {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.nav-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    white-space: nowrap;
}

.nav-link i {
    font-size: 1rem;
}

.nav-link span {
    line-height: 1;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-2px);
}

.nav-link.active {
    background-color: white;
    color: #c9a9a6;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.admin-link {
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.admin-link.active {
    border-color: #c9a9a6;
}

/* User Actions */
.user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-add-novel {
    background: white;
    color: #c9a9a6;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

.btn-add-novel span {
    line-height: 1;
}

.btn-add-novel:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background: #f8f9fa;
}

/* User Menu */
.user-menu {
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-info:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid white;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.user-name {
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-role {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    text-transform: capitalize;
    white-space: nowrap;
}

.dropdown-icon {
    color: white;
    font-size: 0.75rem;
    transition: transform 0.3s;
}

.user-menu:hover .dropdown-icon {
    transform: rotate(180deg);
}

/* Dropdown */
.user-menu:hover .dropdown {
    display: block;
    animation: fadeInDown 0.3s ease;
}

@keyframes fadeInDown {
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
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    min-width: 220px;
    overflow: hidden;
    z-index: 1000;
}

.dropdown::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    color: #2c3e50;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    width: 100%;
    text-align: left;
    background: none;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
}

.dropdown-item i {
    width: 20px;
    text-align: center;
    color: #7f8c8d;
}

.dropdown-item:hover {
    background: #f8f9fa;
    color: #c9a9a6;
    padding-left: 1.5rem;
}

.dropdown-item:hover i {
    color: #c9a9a6;
}

.dropdown-item.logout {
    color: #e74c3c;
}

.dropdown-item.logout:hover {
    background: #fee;
    color: #c0392b;
}

.dropdown-divider {
    height: 1px;
    background: #e9ecef;
    margin: 0.5rem 0;
}

/* Auth Buttons */
.auth-buttons {
    display: flex;
    gap: 0.75rem;
}

.btn-login,
.btn-register {
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    white-space: nowrap;
}

.btn-login span,
.btn-register span {
    line-height: 1;
}

.btn-login {
    color: white;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-login:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
}

.btn-register {
    color: #c9a9a6;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-register:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.mobile-menu-toggle:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* Mobile Menu */
.mobile-menu {
    display: none;
    background: white;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.mobile-menu.active {
    max-height: 600px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-nav {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
}

.mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    color: #2c3e50;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 1rem;
}

.mobile-nav-link i {
    width: 24px;
    text-align: center;
    color: #c9a9a6;
}

.mobile-nav-link:hover {
    background: #f8f9fa;
    color: #c9a9a6;
}

.mobile-divider {
    height: 1px;
    background: #e9ecef;
    margin: 0.5rem 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
    .nav-link span {
        display: none;
    }
    
    .nav-link {
        padding: 0.75rem;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }

    .nav-menu {
        display: none;
    }

    .btn-add-novel span {
        display: none;
    }

    .btn-add-novel {
        padding: 0.75rem;
    }

    .user-details {
        display: none;
    }

    .dropdown-icon {
        display: none;
    }

    .user-info {
        padding: 0.5rem;
    }

    .mobile-menu-toggle {
        display: block;
    }

    .mobile-menu {
        display: block;
    }

    .auth-buttons {
        gap: 0.5rem;
    }

    .btn-login span,
    .btn-register span {
        display: none;
    }

    .btn-login,
    .btn-register {
        padding: 0.75rem;
    }
}

@media (max-width: 480px) {
    .logo-text {
        display: none;
    }

    .logo-icon {
        width: 40px;
        height: 40px;
    }

    .logo-icon i {
        font-size: 1.25rem;
    }
}
</style>
