<script>
import AppHeader from './components/AppHeader.vue';
import ScrollToTop from './components/Common/ScrollToTop.vue';
import SiteFooter from './components/Common/Footer.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    ScrollToTop
    ,SiteFooter
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
  zoom: 0.8; /* Thu nhỏ toàn bộ hệ thống xuống 80% */
}

#app {
  min-height: 100vh;
}

main {
  min-height: calc(100vh - 80px);
}
</style>
