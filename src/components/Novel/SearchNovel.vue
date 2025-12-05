<template>
    <div class="search-novel">
        <div class="search-container">
            <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    :placeholder="placeholder"
                    @input="handleInput"
                    @keyup.enter="handleSearch"
                />
                <button
                    v-if="searchQuery"
                    class="clear-btn"
                    @click="clearSearch"
                    title="Xóa"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <button class="search-btn" @click="handleSearch">
                <i class="fas fa-search"></i>
                <span>Tìm kiếm</span>
            </button>
        </div>

        <!-- Search Suggestions (optional) -->
        <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
            <div
                v-for="suggestion in suggestions"
                :key="suggestion._id"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
            >
                <img
                    v-if="suggestion.coverImage"
                    :src="suggestion.coverImage"
                    :alt="suggestion.title"
                    class="suggestion-cover"
                />
                <div class="suggestion-info">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-author">{{ suggestion.author }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SearchNovel',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Tìm kiếm tiểu thuyết theo tên, tác giả...'
        },
        showSuggestionsOnType: {
            type: Boolean,
            default: false
        },
        novels: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update:modelValue', 'search', 'clear', 'select'],
    data() {
        return {
            searchQuery: this.modelValue || '',
            showSuggestions: false
        };
    },
    watch: {
        modelValue(newVal) {
            this.searchQuery = newVal;
        }
    },
    computed: {
        suggestions() {
            if (!this.searchQuery.trim() || !this.showSuggestionsOnType) {
                return [];
            }
            
            const query = this.searchQuery.toLowerCase();
            return this.novels
                .filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query)
                )
                .slice(0, 5);
        }
    },
    mounted() {
        // Close suggestions when clicking outside
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        handleInput() {
            this.showSuggestions = true;
            this.$emit('update:modelValue', this.searchQuery);
        },
        handleSearch() {
            this.showSuggestions = false;
            this.$emit('search', this.searchQuery);
        },
        clearSearch() {
            this.searchQuery = '';
            this.showSuggestions = false;
            this.$emit('update:modelValue', '');
            this.$emit('clear');
        },
        selectSuggestion(suggestion) {
            this.showSuggestions = false;
            this.$emit('select', suggestion);
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.showSuggestions = false;
            }
        }
    }
};
</script>

<style scoped>
.search-novel {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.search-container {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 1.25rem;
    color: #95a5a6;
    font-size: 1.1rem;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 1rem 3.5rem 1rem 3.5rem;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
}

.search-input:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 4px rgba(201, 169, 166, 0.1);
}

.clear-btn {
    position: absolute;
    right: 1rem;
    width: 28px;
    height: 28px;
    border: none;
    background: #e9ecef;
    color: #7f8c8d;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.clear-btn:hover {
    background: #d1d8dd;
    color: #2c3e50;
}

.search-btn {
    padding: 0 2rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201, 169, 166, 0.4);
}

.search-btn i {
    font-size: 1rem;
}

/* Suggestions Dropdown */
.suggestions {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    animation: slideDown 0.2s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid #f8f9fa;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background: #f8f9fa;
}

.suggestion-cover {
    width: 50px;
    height: 70px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.suggestion-info {
    flex: 1;
    min-width: 0;
}

.suggestion-title {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.suggestion-author {
    font-size: 0.9rem;
    color: #7f8c8d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Scrollbar for suggestions */
.suggestions::-webkit-scrollbar {
    width: 8px;
}

.suggestions::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 0 12px 12px 0;
}

.suggestions::-webkit-scrollbar-thumb {
    background: #c9a9a6;
    border-radius: 4px;
}

.suggestions::-webkit-scrollbar-thumb:hover {
    background: #b8a39e;
}

/* Responsive */
@media (max-width: 768px) {
    .search-container {
        flex-direction: column;
    }

    .search-input {
        padding: 0.875rem 3rem 0.875rem 3rem;
        font-size: 0.95rem;
    }

    .search-btn {
        padding: 0.875rem 1.5rem;
        justify-content: center;
    }

    .suggestion-cover {
        width: 40px;
        height: 56px;
    }

    .suggestion-item {
        padding: 0.75rem;
    }
}

@media (max-width: 480px) {
    .search-input {
        padding: 0.75rem 2.5rem 0.75rem 2.5rem;
        font-size: 0.9rem;
    }

    .search-icon {
        left: 1rem;
        font-size: 1rem;
    }

    .clear-btn {
        right: 0.75rem;
        width: 24px;
        height: 24px;
    }

    .search-btn span {
        display: none;
    }

    .search-btn {
        padding: 0.875rem;
    }
}
</style>
