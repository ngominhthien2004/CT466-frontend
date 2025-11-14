<template>
    <div class="novel-detail">
        <!-- Cover và Info nằm ngang -->
        <div class="novel-header">
            <!-- Bìa -->
            <div class="novel-cover">
                <img :src="novel.coverImage || '/assets/default-book.png'" :alt="novel.title" />
                <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
                    <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
                    {{ isFavorite ? 'Đã yêu thích' : 'Yêu thích' }}
                </button>
            </div>

            <!-- Chi tiết -->
            <div class="novel-info">
                <h1 class="novel-title">{{ novel.title }}</h1>
                
                <div class="novel-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span class="label">Tác giả:</span>
                        <span class="value">{{ novel.author || 'Đang cập nhật' }}</span>
                    </div>
                    
                    <div class="meta-item">
                        <i class="fas fa-tags"></i>
                        <span class="label">Thể loại:</span>
                        <div class="genres">
                            <span v-for="genre in novel.genres" :key="genre" class="genre-tag">
                                {{ genre }}
                            </span>
                            <span v-if="!novel.genres || novel.genres.length === 0" class="value">
                                Chưa phân loại
                            </span>
                        </div>
                    </div>
                    
                    <div class="meta-item">
                        <i class="fas fa-circle-notch"></i>
                        <span class="label">Trạng thái:</span>
                        <span class="value status" :class="novel.status">
                            {{ getStatusText(novel.status) }}
                        </span>
                    </div>
                    
                    <div class="meta-item">
                        <i class="fas fa-eye"></i>
                        <span class="label">Lượt xem:</span>
                        <span class="value">{{ formatNumber(novel.views || 0) }}</span>
                    </div>
                    
                    <div class="meta-item">
                        <i class="fas fa-heart"></i>
                        <span class="label">Lượt thích:</span>
                        <span class="value">{{ formatNumber(novel.likes || 0) }}</span>
                    </div>
                </div>

                <div class="novel-description">
                    <h3>Mô tả</h3>
                    <p>{{ novel.description || 'Chưa có mô tả' }}</p>
                </div>

                <div class="novel-actions">
                    <button class="btn-read" @click="readFirstChapter">
                        <i class="fas fa-book-open"></i>
                        Đọc từ đầu
                    </button>
                    <button class="btn-continue" @click="continueReading" v-if="lastReadChapter">
                        <i class="fas fa-bookmark"></i>
                        Đọc tiếp
                    </button>
                    <button class="btn-edit" @click="editNovel">
                        <i class="fas fa-edit"></i>
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NovelDetail',
    props: {
        novel: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isFavorite: false,
            lastReadChapter: null
        };
    },
    mounted() {
        this.isFavorite = this.novel.favorite || false;
        this.loadLastReadChapter();
    },
    methods: {
        toggleFavorite() {
            this.isFavorite = !this.isFavorite;
            this.$emit('toggle-favorite', this.novel._id, this.isFavorite);
        },
        getStatusText(status) {
            const statusMap = {
                'ongoing': 'Đang ra',
                'completed': 'Hoàn thành',
                'paused': 'Tạm dừng',
                'dropped': 'Ngưng'
            };
            return statusMap[status] || 'Chưa xác định';
        },
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num;
        },
        loadLastReadChapter() {
            // Load từ localStorage
            const history = localStorage.getItem(`reading_history_${this.novel._id}`);
            if (history) {
                this.lastReadChapter = JSON.parse(history);
            }
        },
        readFirstChapter() {
            this.$emit('read-chapter', 'first');
        },
        continueReading() {
            this.$emit('read-chapter', this.lastReadChapter.chapterId);
        },
        editNovel() {
            this.$router.push(`/novels/${this.novel._id}/edit`);
        }
    }
};
</script>

<style scoped>
.novel-detail {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
}

.novel-header {
    display: flex;
    gap: 2rem;
}

.novel-cover {
    flex-shrink: 0;
    width: 300px;
}

.novel-cover img {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 1rem;
}

.favorite-btn {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 2px solid #e74c3c;
    color: #e74c3c;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.favorite-btn:hover {
    background: #e74c3c;
    color: white;
}

.favorite-btn.active {
    background: #e74c3c;
    color: white;
}

.novel-info {
    flex: 1;
}

.novel-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 1.5rem 0;
}

.novel-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
}

.meta-item i {
    width: 20px;
    color: #c9a9a6;
}

.meta-item .label {
    font-weight: 600;
    color: #7f8c8d;
    min-width: 100px;
}

.meta-item .value {
    color: #2c3e50;
}

.genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.genre-tag {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
}

.status.ongoing {
    background: #3498db;
    color: white;
}

.status.completed {
    background: #27ae60;
    color: white;
}

.status.paused {
    background: #f39c12;
    color: white;
}

.status.dropped {
    background: #95a5a6;
    color: white;
}

.novel-description {
    margin-bottom: 1.5rem;
}

.novel-description h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
}

.novel-description p {
    color: #7f8c8d;
    line-height: 1.6;
    margin: 0;
}

.novel-actions {
    display: flex;
    gap: 1rem;
}

.novel-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-read {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
}

.btn-read:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

.btn-continue {
    background: white;
    color: #c9a9a6;
    border: 2px solid #c9a9a6;
}

.btn-continue:hover {
    background: #c9a9a6;
    color: white;
}

.btn-edit {
    background: white;
    color: #3498db;
    border: 2px solid #3498db;
}

.btn-edit:hover {
    background: #3498db;
    color: white;
}

@media (max-width: 768px) {
    .novel-header {
        flex-direction: column;
    }

    .novel-cover {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
    }

    .novel-title {
        font-size: 1.5rem;
    }

    .novel-actions {
        flex-direction: column;
    }

    .novel-actions button {
        width: 100%;
    }
}
</style>
