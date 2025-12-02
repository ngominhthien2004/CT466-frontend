<template>
    <div>
        <!-- Modal overlay version -->
        <div v-if="isModal" class="form-overlay" @click.self="closeForm">
            <div class="form-container">
                <div class="form-header">
                    <h2>
                        <i class="fas fa-book"></i>
                        {{ isEditMode ? 'Cập nhật tiểu thuyết' : 'Thêm tiểu thuyết mới' }}
                    </h2>
                    <button class="btn-close" @click="closeForm">
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

                        <!-- URL ảnh bìa -->
                        <div class="form-group full-width">
                            <label for="coverImage">
                                URL ảnh bìa
                            </label>
                            <input
                                id="coverImage"
                                v-model="formData.coverImage"
                                type="url"
                                placeholder="https://example.com/cover.jpg"
                            />
                            <div v-if="formData.coverImage" class="image-preview">
                                <img :src="formData.coverImage" alt="Preview" @error="handleImageError" />
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
                                        @focus="showSuggestions = true"
                                        @input="showSuggestions = true"
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

                        <!-- Số lượt xem -->
                        <div v-if="!isEditMode" class="form-group">
                            <label for="views">
                                Lượt xem
                            </label>
                            <input
                                id="views"
                                v-model.number="formData.views"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <!-- Số lượt thích -->
                        <div v-if="!isEditMode" class="form-group">
                            <label for="likes">
                                Lượt thích
                            </label>
                            <input
                                id="likes"
                                v-model.number="formData.likes"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <!-- Yêu thích -->
                        <div v-if="!isEditMode" class="form-group full-width">
                            <label class="checkbox-label">
                                <input
                                    v-model="formData.favorite"
                                    type="checkbox"
                                />
                                <span class="checkmark"></span>
                                Đánh dấu là yêu thích
                            </label>
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
        </div>

        <!-- Inline / embedded version -->
        <div v-else class="form-inline">
            <div class="form-container inline-container">
                <div class="form-header">
                    <h2>
                        <i class="fas fa-book"></i>
                        {{ isEditMode ? 'Cập nhật tiểu thuyết' : 'Thêm tiểu thuyết mới' }}
                    </h2>
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

                        <!-- URL ảnh bìa -->
                        <div class="form-group full-width">
                            <label for="coverImage">
                                URL ảnh bìa
                            </label>
                            <input
                                id="coverImage"
                                v-model="formData.coverImage"
                                type="url"
                                placeholder="https://example.com/cover.jpg"
                            />
                            <div v-if="formData.coverImage" class="image-preview">
                                <img :src="formData.coverImage" alt="Preview" @error="handleImageError" />
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
                                        @focus="showSuggestions = true"
                                        @input="showSuggestions = true"
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

                        <div v-if="!isEditMode">
                            <!-- Số lượt xem -->
                            <div class="form-group">
                                <label for="views">
                                    Lượt xem
                                </label>
                                <input
                                    id="views"
                                    v-model.number="formData.views"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <!-- Số lượt thích -->
                            <div class="form-group">
                                <label for="likes">
                                    Lượt thích
                                </label>
                                <input
                                    id="likes"
                                    v-model.number="formData.likes"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <!-- Yêu thích -->
                            <div class="form-group full-width">
                                <label class="checkbox-label">
                                    <input
                                        v-model="formData.favorite"
                                        type="checkbox"
                                    />
                                    <span class="checkmark"></span>
                                    Đánh dấu là yêu thích
                                </label>
                            </div>
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
        </div>
    </div>
</template>

<script>
import { useGenreStore } from '@/stores/genre';

export default {
    name: 'NovelForm',
    props: {
        novel: {
            type: Object,
            default: null
        },
        isModal: {
            type: Boolean,
            default: true
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
            submitting: false
        };
    },
    mounted() {
        // load genres for suggestions
        this.genreStore = useGenreStore();
        if (!this.genreStore.genres || this.genreStore.genres.length === 0) {
            this.genreStore.fetchGenres().catch(() => {});
        }
        if (this.novel) {
            this.formData = {
                title: this.novel.title || '',
                author: this.novel.author || '',
                description: this.novel.description || '',
                genres: this.novel.genres || [],
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
            if (!q) return (this.genreStore.genres || []).filter(g => !this.formData.genres.includes(g.name));
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
                        genres: this.formData.genres,
                        coverImage: this.formData.coverImage,
                        status: this.formData.status
                    };
                } else {
                    data = {
                        ...this.formData,
                        title: this.formData.title.trim(),
                        author: this.formData.author.trim(),
                        description: this.formData.description?.trim() || ''
                    };
                }

                console.log('NovelForm emitting submit with data:', data);
                this.$emit('submit', data);
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

/* Specific styles for NovelForm (nếu cần thêm style riêng) */
.suggestions-list {
    position: absolute;
    background: white;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin-top: 0.5rem;
    max-height: 200px;
    overflow: auto;
    width: 100%;
    z-index: 3000;
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    padding: 0.25rem 0;
}
.suggestions-list li {
    list-style: none;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
}
.suggestions-list li:hover {
    background: #f6f6f6;
}
</style>
