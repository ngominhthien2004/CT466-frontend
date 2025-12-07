<script>
import AppHeader from './components/AppHeader.vue';
import ScrollToTop from './components/Common/ScrollToTop.vue';
import SiteFooter from './components/Common/Footer.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import ChatbotWidget from '@/components/Chatbot/ChatbotWidget.vue';
import { useNotificationStore } from '@/stores';

export default {
  name: 'App',
  components: {
    AppHeader,
    ScrollToTop,
    SiteFooter,
    NotificationModal,
    ChatbotWidget
  },
  setup() {
    const notification = useNotificationStore();
    return { notification };
  }
}
</script>

<template>
  <div id="app">
    <AppHeader />
    <main>
      <router-view />
    </main>
    <SiteFooter />
    <ScrollToTop />
    <ChatbotWidget />
    <!-- Global notification modal mounted once at app root -->
    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      :autoClose="notification.autoClose"
      :duration="notification.duration"
      @close="notification.clear()"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  zoom: 0.8; 
}

#app {
  min-height: 100vh;
}

main {
  min-height: calc(100vh - 80px);
}
</style>
