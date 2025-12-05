<template>
    <div class="chapter-add">
        <div class="page-header">
            <div class="header-content">
                <button @click="goBack" class="btn-back">
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
    </div>
</template>

<script>
import ChapterForm from '@/components/Chapter/ChapterForm.vue';
import ChapterService from '@/services/chapter.service';
import NovelService from '@/services/novel.service';

export default {
    name: 'ChapterAdd',
    components: {
        ChapterForm
    },
    data() {
        return {
            novelId: '',
            novelTitle: '',
            loading: false,
            submitting: false
        };
    },
    async mounted() {
        // Get novelId from query params
        this.novelId = this.$route.query.novelId;
        
        if (!this.novelId) {
            alert('Không tìm thấy ID tiểu thuyết');
            this.$router.push('/admin/novels');
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
                // Redirect first, then show success message
                this.$router.push(`/novels/${this.novelId}`);
                // Show success message after a brief delay
                setTimeout(() => {
                    alert('Đã thêm chương thành công!');
                }, 300);
            } catch (error) {
                console.error('Error creating chapter:', error);
                alert(error.response?.data?.message || 'Không thể thêm chương');
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

.btn-back {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    font-size: 1.2rem;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-3px);
}

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
