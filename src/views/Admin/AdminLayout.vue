<template>
    <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
            <div class="sidebar-header">
                <router-link to="/" class="logo">
                    <i class="fas fa-book"></i>
                    <span v-show="!sidebarCollapsed">NovelMT Admin</span>
                </router-link>
                <button class="toggle-btn" @click="toggleSidebar">
                    <i class="fas" :class="sidebarCollapsed ? 'fa-bars' : 'fa-times'"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <router-link to="/admin" class="nav-item" exact-active-class="active">
                    <i class="fas fa-chart-line"></i>
                    <span v-show="!sidebarCollapsed">Tổng quan</span>
                </router-link>
                
                <router-link to="/admin/novels" class="nav-item" active-class="active">
                    <i class="fas fa-book"></i>
                    <span v-show="!sidebarCollapsed">Quản lý Novels</span>
                </router-link>
                
                <router-link to="/admin/chapters" class="nav-item" active-class="active">
                    <i class="fas fa-file-alt"></i>
                    <span v-show="!sidebarCollapsed">Quản lý Chapters</span>
                </router-link>
                
                <router-link to="/admin/users" class="nav-item" active-class="active">
                    <i class="fas fa-users"></i>
                    <span v-show="!sidebarCollapsed">Quản lý Users</span>
                </router-link>
                
                <router-link to="/admin/comments" class="nav-item" active-class="active">
                    <i class="fas fa-comments"></i>
                    <span v-show="!sidebarCollapsed">Quản lý Comments</span>
                </router-link>

                <div class="nav-divider"></div>

                <router-link to="/" class="nav-item">
                    <i class="fas fa-home"></i>
                    <span v-show="!sidebarCollapsed">Về trang chủ</span>
                </router-link>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <img :src="getUserAvatar()" alt="Admin" class="user-avatar" />
                    <div v-show="!sidebarCollapsed" class="user-details">
                        <span class="user-name">{{ user?.username || 'Admin' }}</span>
                        <span class="user-role">Quản trị viên</span>
                    </div>
                </div>
                <button v-show="!sidebarCollapsed" class="btn-logout" @click="handleLogout">
                    <i class="fas fa-sign-out-alt"></i>
                    Đăng xuất
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <header class="content-header">
                <h1>{{ pageTitle }}</h1>
                <div class="header-actions">
                    <button class="btn-refresh" @click="refreshPage">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </header>

            <div class="content-body">
                <router-view @update-title="updatePageTitle" />
            </div>
        </div>
    </div>
</template>

<script>

import { useAuthStore } from '@/stores';

export default {
    name: 'AdminLayout',
    data() {
        return {
            sidebarCollapsed: false,
            pageTitle: 'Tổng quan',
            authStore: useAuthStore()
        };
    },
    computed: {
        user() {
            return this.authStore.currentUser;
        }
    },
    mounted() {
        this.authStore.loadUser();
        this.updatePageTitle();
    },
    watch: {
        '$route'() {
            this.updatePageTitle();
        }
    },
    methods: {
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },
        getUserAvatar() {
            return this.authStore.userAvatar;
        },
        updatePageTitle() {
            const routeNameMap = {
                'admin-dashboard': 'Tổng quan',
                'admin-novels': 'Quản lý Novels',
                'admin-chapters': 'Quản lý Chapters',
                'admin-users': 'Quản lý Users',
                'admin-comments': 'Quản lý Comments'
            };
            this.pageTitle = routeNameMap[this.$route.name] || 'Admin';
        },
        refreshPage() {
            this.$router.go(0);
        },
        handleLogout() {
            this.authStore.logout();
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f5f7fa;
}

/* Sidebar */
.sidebar {
    width: 280px;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    color: white;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    height: 100vh;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
    width: 80px;
}

.sidebar-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
}

.logo i {
    font-size: 1.5rem;
    color: #c9a9a6;
}

.toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 35px;
    height: 35px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Sidebar Navigation */
.sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.3s;
    position: relative;
}

.nav-item i {
    font-size: 1.25rem;
    width: 24px;
    text-align: center;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.nav-item.active {
    background: rgba(201, 169, 166, 0.2);
    color: white;
    border-left: 4px solid #c9a9a6;
}

.nav-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 1rem 1.5rem;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.user-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 2px solid #c9a9a6;
    object-fit: cover;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.user-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.user-role {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
}

.btn-logout {
    width: 100%;
    padding: 0.75rem;
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid rgba(231, 76, 60, 0.3);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-logout:hover {
    background: rgba(231, 76, 60, 0.3);
}

/* Main Content */
.main-content {
    flex: 1;
    margin-left: 280px;
    transition: margin-left 0.3s ease;
    display: flex;
    flex-direction: column;
}

.sidebar.collapsed ~ .main-content {
    margin-left: 80px;
}

.content-header {
    background: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.content-header h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #2c3e50;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.btn-refresh {
    background: white;
    border: 2px solid #dfe6e9;
    color: #7f8c8d;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-refresh:hover {
    border-color: #c9a9a6;
    color: #c9a9a6;
    transform: rotate(180deg);
}

.content-body {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
    width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar {
        width: 80px;
    }
    
    .sidebar.collapsed {
        width: 0;
    }
    
    .main-content {
        margin-left: 80px;
    }
    
    .sidebar.collapsed ~ .main-content {
        margin-left: 0;
    }
}
</style>
