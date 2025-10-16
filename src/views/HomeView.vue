<template>
    <div class="home">
        <div class="container">
            <!-- Tiểu thuyết mới -->
            <NovelList 
                title="Mới"
                subtitle="Subheading"
                :novels="newNovels"
                :loading="loadingNew"
                :items-per-page="6"
                @toggle-favorite="handleToggleFavorite"
            />

            <!-- Tiểu thuyết nổi bật -->
            <NovelList 
                title="Nổi bật"
                subtitle="Subheading"
                :novels="featuredNovels"
                :loading="loadingFeatured"
                :items-per-page="6"
                @toggle-favorite="handleToggleFavorite"
            />
        </div>
    </div>
</template>

<script>
import NovelList from '@/components/Novel/NovelList.vue';
import { NovelService } from '@/services';

export default {
    name: 'HomeView',
    components: {
        NovelList
    },
    data() {
        return {
            newNovels: [],
            featuredNovels: [],
            loadingNew: false,
            loadingFeatured: false
        };
    },
    async mounted() {
        await this.fetchNovels();
    },
    methods: {
        async fetchNovels() {
            try {
                this.loadingNew = true;
                this.loadingFeatured = true;

                // Lấy tất cả novels
                const allNovels = await NovelService.getAll();

                // Novels mới (sắp xếp theo createdAt)
                this.newNovels = allNovels
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Novels nổi bật (sắp xếp theo views)
                this.featuredNovels = allNovels
                    .sort((a, b) => (b.views || 0) - (a.views || 0));

            } catch (error) {
                console.error('Error fetching novels:', error);
                alert('Không thể tải danh sách tiểu thuyết');
            } finally {
                this.loadingNew = false;
                this.loadingFeatured = false;
            }
        },
        async handleToggleFavorite(novelId, isFavorite) {
            try {
                await NovelService.update(novelId, { favorite: isFavorite });
                
                // Update local data
                this.updateNovelFavorite(this.newNovels, novelId, isFavorite);
                this.updateNovelFavorite(this.featuredNovels, novelId, isFavorite);
            } catch (error) {
                console.error('Error updating favorite:', error);
                alert('Không thể cập nhật yêu thích');
            }
        },
        updateNovelFavorite(novels, novelId, isFavorite) {
            const novel = novels.find(n => n._id === novelId);
            if (novel) {
                novel.favorite = isFavorite;
            }
        }
    }
};
</script>

<style scoped>
.home {
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

@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 0 1rem;
    }
}
</style>
