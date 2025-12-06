<template>
    <div class="home">
        <!-- Hero banner removed per request -->

        <div class="container">
            <!-- Search Section -->
            <section class="search-section">
                <SearchNovel
                    :novels="newNovels"
                    :show-suggestions-on-type="true"
                    @search="handleSearch"
                    @select="handleSelectSuggestion"
                />
            </section>

            <!-- Tiểu thuyết mới -->
            <section class="novel-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-fire"></i>
                        Tiểu thuyết Mới Cập Nhật
                    </h2>
                </div>
                <NovelList 
                    :novels="newNovels"
                    :loading="loadingNew"
                    :items-per-page="6"
                    @toggle-favorite="handleToggleFavorite"
                />
            </section>

            <!-- Tiểu thuyết nổi bật -->
            <section class="novel-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-star"></i>
                        Tiểu thuyết Nổi Bật
                    </h2>
                </div>
                <NovelList 
                    :novels="featuredNovels"
                    :loading="loadingFeatured"
                    :items-per-page="6"
                    @toggle-favorite="handleToggleFavorite"
                />
            </section>
        </div>
        
        <!-- Notification Modal -->
        <NotificationModal
            :show="showNotification"
            :type="notificationType"
            :message="notificationMessage"
            :auto-close="notificationAutoClose"
            @close="() => { showNotification = false; notificationAutoClose = false; notificationMessage = ''; notificationType = 'info' }"
        />
    </div>
</template>

<script>
import NovelList from '@/components/Novel/NovelList.vue';
import SearchNovel from '@/components/Novel/SearchNovel.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import { NovelService } from '@/services';
import { useNovelStore, useAuthStore } from '@/stores';

export default {
    name: 'HomeView',
    components: {
        NovelList,
        SearchNovel,
        EmptyState,
        NotificationModal
    },
    data() {
        return {
            novelStore: useNovelStore(),
            authStore: useAuthStore(),
            loadingNew: false,
            loadingFeatured: false,
            // notification state
            showNotification: false,
            notificationMessage: '',
            notificationType: 'info',
            notificationAutoClose: false
        };
    },
    computed: {
        // Get novels from store
        newNovels() {
            return [...this.novelStore.novels]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        featuredNovels() {
            return [...this.novelStore.novels]
                .sort((a, b) => (b.views || 0) - (a.views || 0));
        },
        totalNovels() {
            return this.novelStore.novels.length;
        },
        totalViews() {
            const total = this.novelStore.novels.reduce((sum, novel) => sum + (novel.views || 0), 0);
            return total > 1000 ? `${(total / 1000).toFixed(1)}K` : total;
        }
    },
    async mounted() {
        await this.fetchNovels();
    },
    methods: {
        async fetchNovels() {
            try {
                this.loadingNew = true;
                this.loadingFeatured = true;

                // Fetch novels into store - computed properties will auto-update
                await this.novelStore.fetchNovels();

            } catch (error) {
                console.error('Error fetching novels:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể tải danh sách tiểu thuyết';
            } finally {
                this.loadingNew = false;
                this.loadingFeatured = false;
            }
        },
        async handleToggleFavorite(novelId) {
            try {
                const userId = this.authStore.user?._id;
                if (!userId) {
                    this.showNotification = true;
                    this.notificationType = 'warning';
                    this.notificationMessage = 'Vui lòng đăng nhập để yêu thích tiểu thuyết';
                    return;
                }
                
                // Store updates novels array - computed properties auto-sync
                await this.novelStore.toggleFavoriteWithApi(novelId, userId);
            } catch (error) {
                console.error('Error updating favorite:', error);
                this.showNotification = true;
                this.notificationType = 'error';
                this.notificationMessage = 'Không thể cập nhật yêu thích';
            }
        },
        handleSearch(query) {
            if (!query || !query.trim()) {
                return;
            }
            
            // Redirect to search page with query
            this.$router.push({
                path: '/search',
                query: { q: query.trim() }
            });
        },
        handleSelectSuggestion(novel) {
            this.$router.push(`/novels/${novel._id}`);
        }
    }
};
</script>

<style scoped>
.home {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Container */
.container {
    max-width: 1400px;
    width: 95%;
    margin: 0 auto;
    padding: 0 2rem 3rem 2rem;
}

/* Search Section */
.search-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Novel Section */
.novel-section {
    margin-bottom: 3rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid #c9a9a6;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title i {
    color: #c9a9a6;
    font-size: 1.75rem;
}

/* Responsive */
@media (max-width: 768px) {
    /* Responsive tweaks preserved for page content */

    .container {
        width: 100%;
        padding: 0 1rem 2rem 1rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .section-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    /* Small screen tweaks preserved for page content */
}
</style>