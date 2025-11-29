<template>
    <div class="genre-header">
        <div class="header-content">
            <h1 class="header-title">
                <i class="fas fa-layer-group"></i>
                Thể loại truyện
            </h1>
            <p class="header-subtitle">
                Khám phá {{ totalGenres }} thể loại truyện đa dạng
            </p>
        </div>
        
        <div v-if="showSearch" class="header-search">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input 
                    type="text" 
                    :value="searchQuery"
                    @input="$emit('update:searchQuery', $event.target.value)"
                    placeholder="Tìm kiếm thể loại..."
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GenreHeader',
    props: {
        totalGenres: {
            type: Number,
            default: 0
        },
        searchQuery: {
            type: String,
            default: ''
        },
        showSearch: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:searchQuery']
};
</script>

<style scoped>
.genre-header {
    margin-bottom: 2rem;
}

.header-content {
    text-align: center;
    margin-bottom: 2rem;
}

.header-title {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.header-title i {
    color: #c9a9a6;
}

.header-subtitle {
    margin: 0;
    font-size: 1.125rem;
    color: #7f8c8d;
}

.header-search {
    max-width: 600px;
    margin: 0 auto;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 1.25rem;
    color: #95a5a6;
    font-size: 1.125rem;
}

.search-box input {
    width: 100%;
    padding: 1rem 1rem 1rem 3.5rem;
    border: 2px solid #e9ecef;
    border-radius: 50px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
}

@media (max-width: 768px) {
    .header-title {
        font-size: 1.75rem;
    }
    
    .header-subtitle {
        font-size: 1rem;
    }
}
</style>
