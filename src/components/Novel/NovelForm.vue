<template>
    <!-- Wrapper with conditional overlay -->
    <div :class="isModal ? 'form-overlay' : 'form-page'" @click.self="isModal && closeForm()">
        <div class="form-container">
            <div class="form-header">
                <h2>
                    <i class="fas fa-book"></i>
                    {{ isEditMode ? 'Cập nhật tiểu thuyết' : 'Thêm tiểu thuyết mới' }}
                </h2>
                <button v-if="isModal" class="btn-close" @click="closeForm">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="form-body">
                <div class="form-grid">
                    <!-- Tên tiểu thuyết -->
                    <div class="form-group full-width">
                        <label for="title">
                            Tên tiểu thuyết <span class="required">*</span>
                        </label>
                        <input
                            id="title"
                            v-model="formData.title"
                            type="text"
                            placeholder="Nhập tên tiểu thuyết..."
                            required
                        />
                        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
                    </div>

                    <!-- Tác giả -->
                    <div class="form-group">
                        <label for="author">
                            Tác giả <span class="required">*</span>
                        </label>
                        <input
                            id="author"
                            v-model="formData.author"
                            type="text"
                            placeholder="Nhập tên tác giả..."
                            required
                        />
                        <span v-if="errors.author" class="error-message">{{ errors.author }}</span>
                    </div>

                    <!-- Trạng thái -->
                    <div class="form-group">
                        <label for="status">
                            Trạng thái <span class="required">*</span>
                        </label>
                        <select id="status" v-model="formData.status" required>
                            <option value="ongoing">Đang ra</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="paused">Tạm dừng</option>
                            <option value="dropped">Ngưng</option>
                        </select>
                    </div>

                    <!-- Ảnh bìa -->
                    <div class="form-group full-width">
                        <label for="coverImageFile">
                            Ảnh bìa
                        </label>
                        <div class="file-input-wrapper">
                            <input
                                type="file"
                                id="coverImageFile"
                                accept="image/*"
                                @change="handleFileSelect"
                                ref="fileInput"
                                style="display: none"
                            />
                            <button
                                type="button"
                                class="btn-file-select"
                                @click="$refs.fileInput.click()"
                            >
                                <i class="fas fa-upload"></i>
                                {{ formData.coverImage ? 'Đổi ảnh' : 'Chọn ảnh' }}
                            </button>
                            <span v-if="fileName" class="file-name">{{ fileName }}</span>
                        </div>
                        <div v-if="formData.coverImage" class="image-preview">
                            <img :src="formData.coverImage" alt="Preview" @error="handleImageError" />
                            <button
                                type="button"
                                class="btn-remove-image"
                                @click="removeImage"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Thể loại -->
                    <div class="form-group full-width">
                        <label for="genres">
                            Thể loại
                        </label>
                        <div class="tags-container">
                            <div class="tags-list">
                                <span
                                    v-for="(genre, index) in formData.genres"
                                    :key="index"
                                    class="tag-item"
                                >
                                    {{ genre }}
                                    <button
                                        type="button"
                                        class="remove-tag"
                                        @click="removeGenre(index)"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            </div>
                            <div class="add-tag-input">
                                <input
                                    id="genres"
                                    v-model="newGenre"
                                    type="text"
                                    placeholder="Tìm hoặc thêm thể loại..."
                                    @focus="handleGenreFocus"
                                    @input="handleGenreInput"
                                    @blur="onGenreBlur"
                                    @keypress.enter.prevent="addGenre"
                                />
                                <button
                                    type="button"
                                    class="btn-add-tag"
                                    @click="addGenre"
                                >
                                    <i class="fas fa-plus"></i>
                                    Thêm
                                </button>

                                <ul v-if="showSuggestions && suggestionList.length" class="suggestions-list">
                                    <li v-for="g in suggestionList" :key="g._id" @mousedown.prevent="selectSuggestion(g)">
                                        {{ g.name }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <small class="hint">Nhấn Enter hoặc click "Thêm" để thêm thể loại</small>
                    </div>

                    <!-- Mô tả -->
                    <div class="form-group full-width">
                        <label for="description">
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            v-model="formData.description"
                            rows="5"
                            placeholder="Nhập mô tả tiểu thuyết..."
                        ></textarea>
                        <small class="char-count">
                            {{ formData.description?.length || 0 }} ký tự
                        </small>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="form-actions">
                    <button type="button" class="btn-cancel" @click="closeForm">
                        <i class="fas fa-times"></i>
                        Hủy
                    </button>
                    <button type="submit" class="btn-submit" :disabled="submitting">
                        <i class="fas" :class="submitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                        {{ submitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới') }}
                    </button>
                </div>
            </form>
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
import { useGenreStore } from '@/stores/genre';
import NotificationModal from '@/components/Common/NotificationModal.vue';

export default {
    name: 'NovelForm',
    components: { NotificationModal },
    props: {
        novel: {
            type: Object,
            default: null
        },
        isModal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formData: {
                title: '',
                author: '',
                description: '',
                genres: [],
                coverImage: '',
                status: 'ongoing',
                views: 0,
                likes: 0,
                favorite: false
            },
            newGenre: '',
            showSuggestions: false,
            errors: {},
            submitting: false,
            fileName: ''
            ,
            showNotification: false,
            notificationMessage: '',
            notificationType: 'error',
            notificationAutoClose: false
        };
    },
    mounted() {
        // load genres for suggestions
        this.genreStore = useGenreStore();
        if (!this.genreStore.genres || this.genreStore.genres.length === 0) {
            this.genreStore.fetchGenres().catch(() => {});
        }
        if (this.novel) {
            // Extract genre names if genres are objects
            const genreNames = (this.novel.genres || []).map(g => 
                typeof g === 'string' ? g : g.name
            );
            
            this.formData = {
                title: this.novel.title || '',
                author: this.novel.author || '',
                description: this.novel.description || '',
                genres: genreNames,
                coverImage: this.novel.coverImage || '',
                status: this.novel.status || 'ongoing',
                views: this.novel.views || 0,
                likes: this.novel.likes || 0,
                favorite: this.novel.favorite || false
            };
        }
    },
    computed: {
        isEditMode() {
            return !!this.novel;
        },
        suggestionList() {
            const q = (this.newGenre || '').toLowerCase().trim();
            // Chỉ hiện suggestions khi có text input
            if (!q) return [];
            return (this.genreStore.genres || [])
                .filter(g => !this.formData.genres.includes(g.name))
                .filter(g => g.name.toLowerCase().includes(q));
        }
    },
    methods: {
        addGenre() {
            const genre = this.newGenre.trim();
            if (!genre) return;
            // if matches an existing genre, use that exact name
            const match = (this.genreStore?.genres || []).find(g => g.name.toLowerCase() === genre.toLowerCase());
            const nameToAdd = match ? match.name : genre;
            if (!this.formData.genres.includes(nameToAdd)) {
                this.formData.genres.push(nameToAdd);
            }
            this.newGenre = '';
            this.showSuggestions = false;
        },
        selectSuggestion(genre) {
            const name = genre?.name || '';
            if (!name) return;
            if (!this.formData.genres.includes(name)) {
                this.formData.genres.push(name);
            }
            this.newGenre = '';
            this.showSuggestions = false;
        },
        handleGenreFocus() {
            // Hiện suggestions nếu đang có text
            if (this.newGenre && this.newGenre.length > 0) {
                this.showSuggestions = true;
            }
        },
        handleGenreInput() {
            // Hiện suggestions ngay khi user bắt đầu gõ
            this.showSuggestions = this.newGenre && this.newGenre.length > 0;
        },
        onGenreBlur() {
            // delay hiding so mousedown on suggestion can register
            setTimeout(() => {
                this.showSuggestions = false;
            }, 150);
        },
        removeGenre(index) {
            this.formData.genres.splice(index, 1);
        },
        handleImageError(event) {
            event.target.src = '/assets/default-book.png';
        },
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.notificationMessage = 'Vui lòng chọn file ảnh';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.notificationMessage = 'Kích thước ảnh không được vượt quá 5MB';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
                return;
            }
            
            this.fileName = file.name;
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                this.formData.coverImage = e.target.result;
            };
            reader.onerror = () => {
                this.notificationMessage = 'Không thể đọc file ảnh';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
            };
            reader.readAsDataURL(file);
        },
        removeImage() {
            this.formData.coverImage = '';
            this.fileName = '';
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },
        validateForm() {
            this.errors = {};
            
            if (!this.formData.title.trim()) {
                this.errors.title = 'Vui lòng nhập tên tiểu thuyết';
            }
            
            if (!this.formData.author.trim()) {
                this.errors.author = 'Vui lòng nhập tên tác giả';
            }
            
            return Object.keys(this.errors).length === 0;
        },
        async handleSubmit() {
            if (!this.validateForm() || this.submitting) {
                return;
            }
            
            this.submitting = true;
            
            try {
                let data;
                if (this.isEditMode) {
                    // When editing, exclude views/likes/favorite from updates
                    data = {
                        title: this.formData.title.trim(),
                        author: this.formData.author.trim(),
                        description: this.formData.description?.trim() || '',
                        genres: [...this.formData.genres], // Convert to plain array
                        coverImage: this.formData.coverImage,
                        status: this.formData.status
                    };
                } else {
                    data = {
                        ...this.formData,
                        title: this.formData.title.trim(),
                        author: this.formData.author.trim(),
                        description: this.formData.description?.trim() || '',
                        genres: [...this.formData.genres] // Convert to plain array
                    };
                }

                console.log('NovelForm emitting submit with data:', data);
                this.$emit('submit-form', data);
            } catch (error) {
                console.error('Form submission error:', error);
                this.submitting = false;
            }
        },
        closeForm() {
            // Reset submitting flag when closing
            this.submitting = false;
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

/* Page mode (not modal) */
.form-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 0;
}

.form-page .form-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: none;
    overflow: visible;
}

/* Specific styles for NovelForm */
.add-tag-input {
    position: relative;
}

.suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    width: 100%;
    z-index: 3000;
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    padding: 0.25rem 0;
}

/* Hide scrollbar but keep functionality */
.suggestions-list::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.suggestions-list {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.suggestions-list li {
    list-style: none;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
}

.suggestions-list li:hover {
    background: #f6f6f6;
}

/* File Upload Styles */
.file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-file-select {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-file-select:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

.file-name {
    color: #2c3e50;
    font-size: 0.9rem;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-preview {
    position: relative;
    margin-top: 1rem;
}

.btn-remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(231, 76, 60, 0.9);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.btn-remove-image:hover {
    background: rgba(231, 76, 60, 1);
    transform: scale(1.1);
}
</style>
