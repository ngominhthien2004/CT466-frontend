<template>
    <transition name="fade">
        <button v-if="visible" @click="scrollToTop" class="scroll-top-btn" title="Lên đầu trang">
            <i class="fas fa-arrow-up"></i>
        </button>
    </transition>
</template>

<script>
export default {
    name: 'ScrollToTop',
    data() {
        return {
            visible: false,
            scrollThreshold: 300
        };
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        handleScroll() {
            this.visible = window.pageYOffset > this.scrollThreshold;
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
};
</script>

<style scoped>
.scroll-top-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
    z-index: 1000;
}

.scroll-top-btn:hover {
    background: linear-gradient(135deg, #b8a39e 0%, #a89491 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.scroll-top-btn:active {
    transform: translateY(-1px);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Responsive */
@media (max-width: 768px) {
    .scroll-top-btn {
        bottom: 1.5rem;
        right: 1.5rem;
        width: 45px;
        height: 45px;
        font-size: 1rem;
    }
}
</style>
