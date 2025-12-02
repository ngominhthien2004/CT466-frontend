<template>
    <div class="novel-edit-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" @click="goBack">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại
                </button>
                <div class="header-text">
                    <h1>
                        <i class="fas fa-edit"></i>
                        Chỉnh sửa tiểu thuyết
                    </h1>
                    <p v-if="novel">{{ novel.title }}</p>
                    <p v-else>Đang tải thông tin...</p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải thông tin tiểu thuyết...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Không thể tải thông tin</h2>
            <p>{{ error }}</p>
            <button class="btn-retry" @click="fetchNovel">
                <i class="fas fa-redo"></i>
                Thử lại
            </button>
        </div>

        <!-- Success/Error Message -->
        <transition name="fade">
            <div v-if="message.show" :class="['message-banner', message.type]">
                <i class="fas" :class="message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
                <span>{{ message.text }}</span>
                <button @click="message.show = false">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </transition>

        <!-- Novel Form -->
        <NovelForm
            v-if="novel"
            :novel="novel"
            @submit="handleUpdateNovel"
            @close="goBack"
        />
    </div>
</template>

<script>
import NovelForm from '@/components/Novel/NovelForm.vue';
import NovelService from '@/services/novel.service';
import { useNovelStore } from '@/stores';

export default {
    name: 'NovelEdit',
    components: {
        NovelForm
    },
    data() {
        return {
            novel: null,
            loading: true,
            error: null,
            message: {
                show: false,
                type: '',
                text: ''
            }
        };
    },
    created() {
        this.novelStore = useNovelStore();
    },
    mounted() {
        this.fetchNovel();
    },
    methods: {
        async fetchNovel() {
            this.loading = true;
            this.error = null;

            try {
                const novelId = this.$route.params.id;
                // NovelService.get returns the data payload
                const response = await NovelService.get(novelId);
                this.novel = response;
            } catch (error) {
                console.error('Error fetching novel:', error);
                this.error = error.response?.data?.message || 'Không tìm thấy tiểu thuyết!';
            } finally {
                this.loading = false;
            }
        },
        async handleUpdateNovel(data) {
            try {
                const novelId = this.$route.params.id;
                // Use store action to update and keep local state in sync
                await this.novelStore.updateNovel(novelId, data);

                // Refresh local novel reference from store
                this.novel = this.novelStore.novelById(novelId) || this.novelStore.currentNovel || this.novel;

                // Show success message
                this.showMessage('success', 'Cập nhật tiểu thuyết thành công!');

                // Redirect to novel detail page after a short delay
                setTimeout(() => {
                    this.$router.push({ name: 'novel-detail', params: { id: novelId } });
                }, 1200);

            } catch (error) {
                console.error('Error updating novel:', error);
                this.showMessage('error',
                    error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tiểu thuyết!'
                );
            }
        },
        showMessage(type, text) {
            this.message = {
                show: true,
                type,
                text
            };
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                this.message.show = false;
            }, 5000);
        },
        goBack() {
            this.$router.go(-1);
        }
    }
};
</script>

<style scoped>
.novel-edit-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem 0;
}

/* Page Header */
.page-header {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.btn-back {
    background: white;
    border: 2px solid #dfe6e9;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-back:hover {
    background: #f8f9fa;
    border-color: #c9a9a6;
    color: #c9a9a6;
    transform: translateX(-5px);
}

.header-text h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-text h1 i {
    color: #c9a9a6;
}

.header-text p {
    margin: 0;
    color: #7f8c8d;
    font-size: 1rem;
}

/* Loading State */
.loading-container {
    max-width: 800px;
    margin: 4rem auto;
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #c9a9a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-container p {
    color: #7f8c8d;
    font-size: 1.1rem;
}

/* Error State */
.error-container {
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-container i {
    font-size: 4rem;
    color: #e74c3c;
    margin-bottom: 1.5rem;
}

.error-container h2 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.75rem;
}

.error-container p {
    color: #7f8c8d;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.btn-retry {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

/* Message Banner */
.message-banner {
    max-width: 800px;
    margin: 0 auto 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-banner.success {
    background: #d4edda;
    color: #155724;
    border: 2px solid #c3e6cb;
}

.message-banner.error {
    background: #f8d7da;
    color: #721c24;
    border: 2px solid #f5c6cb;
}

.message-banner i:first-child {
    font-size: 1.5rem;
}

.message-banner span {
    flex: 1;
}

.message-banner button {
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.25rem;
    opacity: 0.7;
    transition: opacity 0.3s;
}

.message-banner button:hover {
    opacity: 1;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
    transition: all 0.3s;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
    .novel-edit-page {
        padding: 1rem 0;
    }
    
    .header-content {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.5rem;
    }
    
    .btn-back {
        align-self: flex-start;
    }
    
    .header-text h1 {
        font-size: 1.5rem;
    }
    
    .message-banner {
        margin: 0 1rem 1rem;
    }
    
    .loading-container,
    .error-container {
        margin: 2rem 1rem;
        padding: 2rem 1.5rem;
    }
}
</style>
