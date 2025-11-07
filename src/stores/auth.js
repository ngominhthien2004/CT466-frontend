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
            const user = AuthService.getCurrentUser()
            if (user) {
                this.user = user
                this.isLoggedIn = true
            }
        },
        
        login(userData) {
            this.user = userData
            this.isLoggedIn = true
            AuthService.setCurrentUser(userData)
        },
        
        logout() {
            this.user = null
            this.isLoggedIn = false
            AuthService.logout()
        },
        
        updateUser(userData) {
            this.user = { ...this.user, ...userData }
            AuthService.setCurrentUser(this.user)
        }
    }
})
