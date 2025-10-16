<template>
    <div class="novel-view">
        <div class="container">
            <!-- Loading -->
            <div v-if="loading" class="loading">
                <p>Đang tải thông tin tiểu thuyết...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button @click="$router.push('/')" class="btn-back">
                    <i class="fas fa-arrow-left"></i>
                    Quay về trang chủ
                </button>
            </div>

            <!-- Content -->
            <template v-else-if="novel">
                <!-- Novel Detail -->
                <NovelDetail 
                    :novel="novel"
                    @toggle-favorite="handleToggleFavorite"
                    @read-chapter="handleReadChapter"
                />

                <!-- Chapter List -->
                <ChapterList 
                    :chapters="chapters"
                    :loading="loadingChapters"
                    @read-chapter="handleReadChapter"
                />
            </template>
        </div>
    </div>
</template>

<script>
import NovelDetail from '@/components/Novel/NovelDetail.vue';
import ChapterList from '@/components/Chapter/ChapterList.vue';
import { NovelService, ChapterService } from '@/services';

export default {
    name: 'NovelView',
    components: {
        NovelDetail,
        ChapterList
    },
    data() {
        return {
            novel: null,
            chapters: [],
            loading: false,
            loadingChapters: false,
            error: null
        };
    },
    async mounted() {
        await this.fetchNovelDetail();
        await this.fetchChapters();
    },
    methods: {
        async fetchNovelDetail() {
            try {
                this.loading = true;
                this.error = null;
                const novelId = this.$route.params.id;
                
                this.novel = await NovelService.get(novelId);
                
                // Tăng view count
                await NovelService.update(novelId, { 
                    views: (this.novel.views || 0) + 1 
                });
                
            } catch (error) {
                console.error('Error fetching novel:', error);
                this.error = 'Không thể tải thông tin tiểu thuyết';
            } finally {
                this.loading = false;
            }
        },
        async fetchChapters() {
            try {
                this.loadingChapters = true;
                const novelId = this.$route.params.id;
                
                // Lấy tất cả chapters của novel này
                const allChapters = await ChapterService.getAll();
                this.chapters = allChapters.filter(c => c.novelId === novelId);
                
            } catch (error) {
                console.error('Error fetching chapters:', error);
            } finally {
                this.loadingChapters = false;
            }
        },
        async handleToggleFavorite(novelId, isFavorite) {
            try {
                await NovelService.update(novelId, { favorite: isFavorite });
                this.novel.favorite = isFavorite;
            } catch (error) {
                console.error('Error updating favorite:', error);
                alert('Không thể cập nhật yêu thích');
            }
        },
        handleReadChapter(chapterId) {
            if (chapterId === 'first') {
                // Đọc chương đầu tiên
                if (this.chapters.length > 0) {
                    const sortedChapters = [...this.chapters].sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                    chapterId = sortedChapters[0]._id;
                }
            }
            
            // Lưu lịch sử đọc
            localStorage.setItem(`reading_history_${this.novel._id}`, JSON.stringify({
                chapterId: chapterId,
                timestamp: new Date().toISOString()
            }));
            
            // Chuyển đến trang đọc chapter
            this.$router.push(`/chapters/${chapterId}`);
        }
    }
};
</script>

<style scoped>
.novel-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem;
}

.loading,
.error {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading p {
    color: #7f8c8d;
    font-size: 1.1rem;
    margin: 0;
}

.error {
    color: #e74c3c;
}

.error i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error p {
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
}

.btn-back {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 0 1rem;
    }
}
</style>
