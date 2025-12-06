<template>
  <div v-if="show" class="notification-overlay" @click.self="$emit('close')">
    <div class="notification-modal" :class="type">
      <div class="notification-header">
        <div class="header-left">
          <h3>{{ title }}</h3>
        </div>
      </div>

      <div class="notification-body">
        <p class="message" v-html="message"></p>
      </div>

      <div class="notification-actions">
        <button class="btn btn-close" @click="$emit('close')">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationModal',
  props: {
    show: { type: Boolean, default: false },
    type: { type: String, default: 'info' }, // 'success' | 'error' | 'info'
    message: { type: String, default: '' },
    autoClose: { type: Boolean, default: false },
    duration: { type: Number, default: 3000 }
  },
  data() {
    return {
      _timer: null
    };
  },
  watch: {
    show(newVal) {
      if (newVal && this.autoClose) {
        this.clearTimer();
        this._timer = setTimeout(() => {
          this.$emit('close');
        }, this.duration);
      } else {
        this.clearTimer();
      }
    }
  },
  beforeUnmount() {
    this.clearTimer();
  },
  computed: {
    title() {
      if (this.type === 'success') return 'Thành công';
      if (this.type === 'error') return 'Lỗi';
      return 'Thông báo';
    }
    ,
    // icon removed — header shows title only
  }
  ,
  methods: {
    clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }
  }
};
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  padding: 1rem;
}
.notification-modal {
  width: 520px;
  max-width: 100%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  line-clamp: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.notification-modal.success .notification-header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; }
.notification-modal.error .notification-header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; }
.notification-modal.info .notification-header { background: linear-gradient(135deg, #3498db 0%, #2c82d9 100%); color: white; }
.notification-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 0.9rem 1rem;
}
.notification-header .header-left { display:flex; align-items:center; gap:0.75rem; }
.notification-header h3 { margin:0; font-size:1.05rem; font-weight:700; }
.notification-header i { font-size:1.35rem; }
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: rgba(255,255,255,0.95);
}
  .notification-body { padding: 1rem; color: #333; border-top: 1px solid rgba(0,0,0,0.03); }
  .notification-body .message {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  /* Reserve space for up to three lines */
  min-height: 4.8rem;

  overflow: hidden;
  word-break: break-word;
  white-space: normal;
}
.notification-actions { padding: 0.75rem 1rem; display:flex; justify-content:flex-end; gap:0.5rem; border-top: 1px solid rgba(0,0,0,0.04); }
.btn { padding: 0.5rem 0.9rem; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn-close { background:#f1f1f1; color:#333; }

@media (max-width: 576px) {
  .notification-modal { width: 100%; }
  .notification-header h3 { font-size: 1rem; }
}
</style>
