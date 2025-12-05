import { defineStore } from 'pinia'
import AuthService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isLoggedIn: false
    }),
    
    getters: {
        currentUser: (state) => state.user,
        isAuthenticated: (state) => state.isLoggedIn,
        userId: (state) => state.user?._id,
        username: (state) => state.user?.username,
        userRole: (state) => {
            const role = state.user?.role || 'user'
            // Case-insensitive check for admin
            return role.toLowerCase() === 'admin' ? 'Quản trị viên' : 'Người dùng'
        },
        userAvatar: (state) => {
            if (!state.user?.avatar) {
                return '/assets/default-avatar.svg'
            }
            
            // Nếu avatar là URL đầy đủ
            if (state.user.avatar.startsWith('http')) {
                return state.user.avatar
            }
            
            // Nếu là path tương đối
            return `/assets/user/${state.user._id}/${state.user.avatar}`
        }
    },
    
    actions: {
        loadUser() {
            const user = AuthService.getUser()
            if (user) {
                this.user = user
                this.isLoggedIn = true
            }
        },
        
        login(userData) {
            this.user = userData
            this.isLoggedIn = true
            AuthService.saveUser(userData)
        },
        
        logout() {
            this.user = null
            this.isLoggedIn = false
            AuthService.logout()
            // Redirect to home after logout
            window.location.href = '/'
        },
        
        updateUser(userData) {
            this.user = { ...this.user, ...userData }
            AuthService.saveUser(this.user)
        }
    }
})
