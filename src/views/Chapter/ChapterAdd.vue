<template>
    <div class="chapter-add">
        <div class="page-header">
            <div class="header-content">
                <button @click="goBack" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div>
                    <h1>
                        <i class="fas fa-plus-circle"></i>
                        Thêm chương mới
                    </h1>
                    <p v-if="novelTitle">Tiểu thuyết: {{ novelTitle }}</p>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <ChapterForm
                :novel-id="novelId"
                :loading="loading"
                @submit="handleSubmit"
                @cancel="goBack"
            />
        </div>

        <NotificationModal
            :show="showNotification"
            :type="notificationType"
            :message="notificationMessage"
            :autoClose="notificationAutoClose"
            @close="showNotification = false"
        />
    </div>
</template>

<script>
import ChapterForm from '@/components/Chapter/ChapterForm.vue';
import ChapterService from '@/services/chapter.service';
import NovelService from '@/services/novel.service';
import NotificationModal from '@/components/Common/NotificationModal.vue';

export default {
    name: 'ChapterAdd',
    components: {
        ChapterForm,
        NotificationModal
    },
    data() {
        return {
            novelId: '',
            novelTitle: '',
            loading: false,
            submitting: false,
            showNotification: false,
            notificationMessage: '',
            notificationType: 'success',
            notificationAutoClose: false
        };
    },
    async mounted() {
        // Get novelId from query params
        this.novelId = this.$route.query.novelId;
        
        if (!this.novelId) {
            this.notificationMessage = 'Không tìm thấy ID tiểu thuyết';
            this.notificationType = 'error';
            this.notificationAutoClose = false;
            this.showNotification = true;
            setTimeout(() => {
                this.$router.push('/admin/novels');
            }, 2000);
            return;
        }

        // Fetch novel info
        try {
            const novel = await NovelService.get(this.novelId);
            this.novelTitle = novel.title;
        } catch (error) {
            console.error('Error fetching novel:', error);
        }
    },
    methods: {
        async handleSubmit(chapterData) {
            // Prevent double submission
            if (this.submitting) return;
            
            // Check if chapterData is valid (not an event object)
            if (!chapterData || !chapterData.title) {
                console.warn('Invalid chapter data received, ignoring');
                return;
            }
            
            console.log('Submitting chapter data:', chapterData);
            this.submitting = true;
            this.loading = true;
            try {
                await ChapterService.create(chapterData);
                // Show success message first so modal is visible, then navigate
                this.notificationMessage = 'Đã thêm chương thành công!';
                this.notificationType = 'success';
                this.notificationAutoClose = true;
                this.showNotification = true;
                // Navigate after a short delay so user sees the notification
                setTimeout(() => {
                    this.$router.push(`/novels/${this.novelId}`);
                }, 1500);
            } catch (error) {
                console.error('Error creating chapter:', error);
                this.notificationMessage = error.response?.data?.message || 'Không thể thêm chương';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
            } finally {
                this.loading = false;
                this.submitting = false;
            }
        },
        goBack() {
            this.$router.push(`/novels/${this.novelId}`);
        }
    }
};
</script>

<style scoped>
.chapter-add {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 2rem;
}

.page-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

/* back button uses global .btn + variant classes from src/assets/buttons.css */

.header-content h1 {
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.8rem;
}

.header-content p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
}

.content-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
}

@media (max-width: 768px) {
    .page-header {
        padding: 1.5rem;
    }

    .header-content h1 {
        font-size: 1.5rem;
    }

    .content-wrapper {
        padding: 0 1rem;
    }
}
</style>
