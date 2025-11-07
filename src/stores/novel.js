import { defineStore } from 'pinia'
import NovelService from '@/services/novel.service'

export const useNovelStore = defineStore('novel', {
    state: () => ({
        novels: [],
        currentNovel: null,
        loading: false,
        error: null,
        favorites: []
    }),
    
    getters: {
        allNovels: (state) => state.novels,
        novelById: (state) => (id) => state.novels.find(n => n._id === id),
        favoriteNovels: (state) => state.novels.filter(n => state.favorites.includes(n._id)),
        totalNovels: (state) => state.novels.length,
        totalViews: (state) => state.novels.reduce((sum, n) => sum + (n.views || 0), 0),
        recentNovels: (state) => {
            return [...state.novels]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 10)
        },
        popularNovels: (state) => {
            return [...state.novels]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 10)
        }
    },
    
    actions: {
        async fetchNovels() {
            this.loading = true
            this.error = null
            try {
                const response = await NovelService.getAll()
                this.novels = response.data || []
            } catch (error) {
                this.error = error.message
                console.error('Error fetching novels:', error)
            } finally {
                this.loading = false
            }
        },
        
        async fetchNovel(id) {
            this.loading = true
            this.error = null
            try {
                const response = await NovelService.get(id)
                this.currentNovel = response.data
                return response.data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching novel:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async createNovel(data) {
            this.loading = true
            this.error = null
            try {
                const response = await NovelService.create(data)
                this.novels.push(response.data)
                return response.data
            } catch (error) {
                this.error = error.message
                console.error('Error creating novel:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async updateNovel(id, data) {
            this.loading = true
            this.error = null
            try {
                const response = await NovelService.update(id, data)
                const index = this.novels.findIndex(n => n._id === id)
                if (index !== -1) {
                    this.novels[index] = response.data
                }
                if (this.currentNovel?._id === id) {
                    this.currentNovel = response.data
                }
                return response.data
            } catch (error) {
                this.error = error.message
                console.error('Error updating novel:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async deleteNovel(id) {
            this.loading = true
            this.error = null
            try {
                await NovelService.delete(id)
                this.novels = this.novels.filter(n => n._id !== id)
                if (this.currentNovel?._id === id) {
                    this.currentNovel = null
                }
            } catch (error) {
                this.error = error.message
                console.error('Error deleting novel:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        loadFavorites() {
            const stored = localStorage.getItem('favorite_novels')
            if (stored) {
                this.favorites = JSON.parse(stored)
            }
        },
        
        toggleFavorite(novelId) {
            const index = this.favorites.indexOf(novelId)
            if (index === -1) {
                this.favorites.push(novelId)
            } else {
                this.favorites.splice(index, 1)
            }
            localStorage.setItem('favorite_novels', JSON.stringify(this.favorites))
        },
        
        isFavorite(novelId) {
            return this.favorites.includes(novelId)
        }
    }
})
