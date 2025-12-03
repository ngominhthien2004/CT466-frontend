<template>
    <div class="chapter-edit">
        <div class="page-header">
            <div class="header-content">
                <button @click="goBack" class="btn-back">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div>
                    <h1>
                        <i class="fas fa-edit"></i>
                        Chỉnh sửa chương
                    </h1>
                    <p v-if="novelTitle">Truyện: {{ novelTitle }}</p>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <div v-if="loadingChapter" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải thông tin chương...</p>
            </div>

            <ChapterForm
                v-else-if="chapter"
                :chapter="chapter"
                :novel-id="chapter.novelId"
                :loading="loading"
                @submit="handleSubmit"
                @cancel="goBack"
            />

            <div v-else class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không tìm thấy thông tin chương</p>
            </div>
        </div>
    </div>
</template>

<script>
import ChapterForm from '@/components/Chapter/ChapterForm.vue';
import ChapterService from '@/services/chapter.service';
import NovelService from '@/services/novel.service';

export default {
    name: 'ChapterEdit',
    components: {
        ChapterForm
    },
    data() {
        return {
            chapterId: '',
            chapter: null,
            novelTitle: '',
            loading: false,
            loadingChapter: true,
            submitting: false
        };
    },
    async mounted() {
        this.chapterId = this.$route.params.id;
        await this.fetchChapter();
    },
    methods: {
        async fetchChapter() {
            if (!this.chapterId) {
                alert('Không tìm thấy ID chương');
                this.$router.push('/');
                return;
            }

            try {
                this.loadingChapter = true;
                this.chapter = await ChapterService.get(this.chapterId);
                
                // Fetch novel info
                if (this.chapter.novelId) {
                    try {
                        const novel = await NovelService.get(this.chapter.novelId);
                        this.novelTitle = novel.title;
                    } catch (error) {
                        console.error('Error fetching novel:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching chapter:', error);
                alert('Không thể tải thông tin chương');
            } finally {
                this.loadingChapter = false;
            }
        },
        async handleSubmit(chapterData) {
            // Prevent double submission
            if (this.submitting) return;
            
            // Check if chapterData is valid (not an event object)
            if (!chapterData || !chapterData.title) {
                console.warn('Invalid chapter data received, ignoring');
                return;
            }
            
            this.submitting = true;
            this.loading = true;
            try {
                await ChapterService.update(this.chapterId, chapterData);
                // Redirect first, then show success message
                this.$router.push(`/novels/${this.chapter.novelId}`);
                // Show success message after a brief delay
                setTimeout(() => {
                    alert('Đã cập nhật chương thành công!');
                }, 300);
            } catch (error) {
                console.error('Error updating chapter:', error);
                alert(error.response?.data?.message || 'Không thể cập nhật chương');
            } finally {
                this.loading = false;
                this.submitting = false;
            }
        },
        goBack() {
            if (this.chapter?.novelId) {
                this.$router.push(`/novels/${this.chapter.novelId}`);
            } else {
                this.$router.push('/');
            }
        }
    }
};
</script>

<style scoped>
.chapter-edit {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 2rem;
}

.page-header {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
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

.loading-state,
.error-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state i,
.error-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.loading-state i {
    color: #c9a9a6;
}

.error-state i {
    color: #e74c3c;
}

.loading-state p,
.error-state p {
    margin: 0;
    color: #7f8c8d;
    font-size: 1.1rem;
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
