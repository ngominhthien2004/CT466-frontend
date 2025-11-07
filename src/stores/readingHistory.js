import { defineStore } from 'pinia'

export const useReadingHistoryStore = defineStore('readingHistory', {
    state: () => ({
        history: []
    }),
    
    getters: {
        allHistory: (state) => state.history,
        getNovelHistory: (state) => (novelId) => {
            return state.history.find(h => h.novelId === novelId)
        },
        recentlyRead: (state) => {
            return [...state.history]
                .sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead))
                .slice(0, 20)
        }
    },
    
    actions: {
        loadHistory() {
            const stored = localStorage.getItem('reading_history')
            if (stored) {
                this.history = JSON.parse(stored)
            }
        },
        
        saveHistory() {
            localStorage.setItem('reading_history', JSON.stringify(this.history))
        },
        
        addToHistory(novelId, chapterId, chapterTitle) {
            const index = this.history.findIndex(h => h.novelId === novelId)
            
            const historyItem = {
                novelId,
                chapterId,
                chapterTitle,
                lastRead: new Date().toISOString()
            }
            
            if (index !== -1) {
                this.history[index] = historyItem
            } else {
                this.history.push(historyItem)
            }
            
            this.saveHistory()
        },
        
        removeFromHistory(novelId) {
            this.history = this.history.filter(h => h.novelId !== novelId)
            this.saveHistory()
        },
        
        clearHistory() {
            this.history = []
            this.saveHistory()
        }
    }
})
