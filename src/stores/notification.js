import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    show: false,
    message: '',
    type: 'info',
    autoClose: false,
    duration: 3000
  }),
  actions: {
    showNotification(message, type = 'info', autoClose = false, duration = 3000) {
      this.message = message
      this.type = type
      this.autoClose = autoClose
      this.duration = duration
      this.show = true
    },
    clear() {
      this.show = false
      this.message = ''
      this.type = 'info'
      this.autoClose = false
      this.duration = 3000
    }
  }
})
