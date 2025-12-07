<template>
    <div class="novel-add-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <button class="btn btn-secondary btn-back" @click="goBack">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại
                </button>
                <div class="header-text">
                    <h1>
                        <i class="fas fa-plus-circle"></i>
                        Thêm tiểu thuyết mới
                    </h1>
                    <p>Điền thông tin để thêm tiểu thuyết vào hệ thống</p>
                </div>
            </div>
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
            ref="novelForm"
            :isModal="false"
            @submit-form="handleCreateNovel"
            @close="goBack"
        />
    </div>
</template>

<script>
import NovelForm from '@/components/Novel/NovelForm.vue';
import NovelService from '@/services/novel.service';
import { useAuthStore } from '@/stores';

export default {
    name: 'NovelAdd',
    components: {
        NovelForm
    },
    data() {
        return {
            authStore: useAuthStore(),
            message: {
                show: false,
                type: '',
                text: ''
            }
        };
    },
    methods: {
        async handleCreateNovel(data) {
            console.log('NovelAdd handleCreateNovel received data:', data);
            console.log('Data keys:', Object.keys(data));
            console.log('Title value:', data.title);
            
            try {
                // Add createdBy field
                const novelData = {
                    ...data,
                    createdBy: this.authStore.user?._id
                };
                
                const novel = await NovelService.create(novelData);
                
                // Show success message
                this.showMessage('success', 'Thêm tiểu thuyết thành công!');
                
                // Redirect to novel detail page after 1.5s
                setTimeout(() => {
                    this.$router.push(`/novels/${novel._id}`);
                }, 1500);
                
            } catch (error) {
                console.error('Error creating novel:', error);
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                console.error('Response headers:', error.response?.headers);
                
                this.showMessage('error', 
                    error.response?.data?.message || 'Có lỗi xảy ra khi thêm tiểu thuyết!'
                );
                
                // Reset submitting state in form
                if (this.$refs.novelForm) {
                    this.$refs.novelForm.submitting = false;
                }
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
.novel-add-page {
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

.header-content .btn-back {
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
    .novel-add-page {
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
}
</style>
