<template>
    <div class="chapter-form">
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="chapterNumber">
                    Số chương <span class="required">*</span>
                </label>
                <input
                    id="chapterNumber"
                    v-model.number="formData.chapterNumber"
                    type="number"
                    min="1"
                    placeholder="Ví dụ: 1"
                    required
                />
            </div>

            <div class="form-group">
                <label for="title">
                    Tiêu đề <span class="required">*</span>
                </label>
                <input
                    id="title"
                    v-model="formData.title"
                    type="text"
                    placeholder="Ví dụ: Khởi đầu"
                    required
                />
            </div>

            <div class="form-group">
                <label for="content">
                    Nội dung <span class="required">*</span>
                </label>
                <textarea
                    id="content"
                    v-model="formData.content"
                    rows="15"
                    placeholder="Nhập nội dung chương..."
                    required
                ></textarea>
                <small class="help-text">{{ contentLength }} ký tự</small>
                <small class="help-text">{{ maxInfoMessage }}</small>
            </div>

            <div class="form-actions">
                <button type="button" @click="$emit('cancel')" class="btn btn-cancel">
                    <i class="fas fa-times"></i>
                    Hủy
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                    {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: 'ChapterForm',
    props: {
        chapter: {
            type: Object,
            default: null
        },
        novelId: {
            type: String,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formData: {
                novelId: '',
                chapterNumber: 1,
                title: '',
                content: ''
            }
        };
    },
    computed: {
        isEditMode() {
            return !!this.chapter;
        },
        contentLength() {
            return this.formData.content.length;
        }
        ,
        // Practical maximum info (MongoDB document size)
        maxInfoMessage() {
            const maxBytes = 16 * 1024 * 1024; // 16 MB
            const approxMillions = Math.floor(maxBytes / 1000000);
            return `Giới hạn 200.000 kí tự`;
        }
    },
    watch: {
        novelId: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.formData.novelId = newVal;
                }
            }
        }
    },
    mounted() {
        // Always set novelId from props
        this.formData.novelId = this.novelId;
        
        if (this.chapter) {
            this.formData = {
                novelId: this.novelId,
                chapterNumber: this.chapter.chapterNumber || 1,
                title: this.chapter.title || '',
                content: this.chapter.content || ''
            };
        }
    },
    methods: {
        handleSubmit() {
            console.log('ChapterForm - Submitting data:', this.formData);
            this.$emit('submit', { ...this.formData });
        }
    }
};
</script>

<style scoped>
.chapter-form {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.required {
    color: #e74c3c;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 4px rgba(201, 169, 166, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 300px;
}

.help-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #f8f9fa;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    font-size: 1rem;
}

.btn-cancel {
    background: #e9ecef;
    color: #495057;
}

.btn-cancel:hover {
    background: #dee2e6;
}

/* Button styles moved to buttons.css */

@media (max-width: 768px) {
    .chapter-form {
        padding: 1.5rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
