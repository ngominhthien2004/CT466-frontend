<template>
    <div class="form-overlay" @click.self="closeForm">
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
                                    v-model="newGenre"
                                    type="text"
                                    placeholder="Nhập thể loại..."
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
</template>

<script>
export default {
    name: 'NovelForm',
    props: {
        novel: {
            type: Object,
            default: null
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
            errors: {},
            submitting: false
        };
    },
    computed: {
        isEditMode() {
            return !!this.novel;
        }
    },
    mounted() {
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
    methods: {
        addGenre() {
            const genre = this.newGenre.trim();
            if (genre && !this.formData.genres.includes(genre)) {
                this.formData.genres.push(genre);
                this.newGenre = '';
            }
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
            if (!this.validateForm()) {
                return;
            }
            
            this.submitting = true;
            
            try {
                const data = {
                    ...this.formData,
                    title: this.formData.title.trim(),
                    author: this.formData.author.trim(),
                    description: this.formData.description?.trim() || '',
                };
                
                this.$emit('submit', data);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                this.submitting = false;
            }
        },
        closeForm() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

/* Specific styles for NovelForm (nếu cần thêm style riêng) */
</style>
