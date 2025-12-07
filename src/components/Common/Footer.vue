<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="col about">
        <div class="brand">
          <img src="../../../assets/logo.png" alt="logo" class="logo" />
          <h3>NovelMT</h3>
        </div>
        <p>Nền tảng nghe tiểu thuyết hàng đầu Việt Nam. Hàng nghìn tiểu thuyết hay, cập nhật liên tục.</p>
      </div>

      <div class="col links">
        <h4>Liên Kết</h4>
        <ul>
          <li><router-link to="/">Trang chủ</router-link></li>
          <li><router-link to="/genres">Thể loại</router-link></li>
          <li><router-link to="/search">Tìm kiếm</router-link></li>
          <li><router-link to="/history">Lịch sử đọc</router-link></li>
        </ul>
      </div>

      <div class="col support">
        <h4>Hỗ Trợ</h4>
        <ul>
          <li><router-link to="/help">Câu hỏi thường gặp</router-link></li>
          <li><router-link to="/contact">Liên hệ</router-link></li>
          <li><router-link to="/terms">Điều khoản sử dụng</router-link></li>
          <li><router-link to="/privacy">Chính sách bảo mật</router-link></li>
        </ul>
      </div>

      <div class="col contact">
        <h4>Liên Hệ</h4>
        <ul class="contact-list">
          <li><i class="far fa-envelope"></i> support@novelmt.vn</li>
        </ul>
      </div>
    </div>

  </footer>
</template>

<script>
export default {
  name: 'SiteFooter',
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.site-footer {
  background: #fff;
  color: #222;
  padding: 3.5rem 0 1rem;
  position: relative;
}
.footer-inner {
  /* Match site container used elsewhere for consistent alignment */
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 2rem;
  align-items: start;
}
.col h4 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding-bottom: 0.75rem;
}
.brand { display:flex; align-items:center; gap:0.6rem; }
.logo { width:46px; height:46px; border-radius:50%; object-fit:cover; border:3px solid rgba(255,255,255,0.18); }
.about p { margin-top:0.75rem; line-height:1.6; color: rgba(0,0,0,0.75); }
.socials { margin-top:1rem; }
.socials a { display:inline-flex; width:40px; height:40px; align-items:center; justify-content:center; margin-right:0.6rem; background: rgba(0,0,0,0.06); border-radius:50%; color: rgba(0,0,0,0.9); text-decoration:none; }
.socials a:hover { background: rgba(0,0,0,0.12); }
.links ul, .support ul, .contact-list { list-style:none; padding:0; margin:0; }
.links li, .support li { margin:0.6rem 0; }
.links a, .support a { color: rgba(0,0,0,0.85); text-decoration:none; }
.links a:hover, .support a:hover { text-decoration:underline; }
.contact-list li { display:flex; gap:0.6rem; align-items:center; margin:0.6rem 0; color: rgba(0,0,0,0.85); }
.contact-list i { width:18px; text-align:center; }
.footer-bottom { margin-top:2rem; border-top:1px solid rgba(0,0,0,0.08); padding-top:1rem; display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; font-size:0.95rem; color: rgba(0,0,0,0.75); }
.footer-bottom > div { text-align: center; }
.site-footer { padding: 3.5rem 0 1rem; }
.heart { color:#ff6b6b; margin:0 0.25rem; }
.float-avatar { position:fixed; right:18px; bottom:18px; width:68px; height:68px; border-radius:50%; box-shadow:0 6px 18px rgba(0,0,0,0.25); background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); display:flex; align-items:center; justify-content:center; cursor:pointer; border:3px solid rgba(255,255,255,0.18); }
.float-avatar img { width:58px; height:58px; border-radius:50%; object-fit:cover; }

@media (max-width: 900px) {
  .footer-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .footer-inner { grid-template-columns: 1fr; }
  .float-avatar { right:12px; bottom:12px; }
}
</style>
