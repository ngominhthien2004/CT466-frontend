<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="$emit('change', 1)"
      title="Trang đầu"
    >
      <i class="fas fa-angle-double-left"></i>
    </button>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="$emit('change', currentPage - 1)"
      title="Trang trước"
    >
      <i class="fas fa-angle-left"></i>
    </button>

    <template v-for="page in visiblePages" :key="page">
      <button 
        v-if="page !== '...'"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="$emit('change', page)"
      >
        {{ page }}
      </button>
      <span v-else class="page-dots">...</span>
    </template>

    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('change', currentPage + 1)"
      title="Trang sau"
    >
      <i class="fas fa-angle-right"></i>
    </button>

    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('change', totalPages)"
      title="Trang cuối"
    >
      <i class="fas fa-angle-double-right"></i>
    </button>

    <div class="page-info">
      Trang {{ currentPage }} / {{ totalPages }} 
      <span v-if="totalItems">(Tổng {{ totalItems }})</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 1
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    totalItems: {
      type: Number,
      default: 0
    }
  },
  emits: ['change'],
  computed: {
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 7) {
        // Hiển thị tất cả nếu <= 7 trang
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Luôn hiển thị trang đầu
        pages.push(1);
        
        if (current > 3) {
          pages.push('...');
        }
        
        // Hiển thị các trang xung quanh trang hiện tại
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
          pages.push(i);
        }
        
        if (current < total - 2) {
          pages.push('...');
        }
        
        // Luôn hiển thị trang cuối
        pages.push(total);
      }
      
      return pages;
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1.5rem;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #c9a9a6;
  color: white;
  border-color: #c9a9a6;
  transform: translateY(-2px);
}

.page-btn.active {
  background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
  color: white;
  border-color: #c9a9a6;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f5f5f5;
}

.page-dots {
  padding: 0 8px;
  color: #999;
  user-select: none;
}

.page-info {
  margin-left: 1rem;
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pagination {
    gap: 0.25rem;
    padding: 1rem;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    font-size: 0.9rem;
  }

  .page-info {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
    margin-left: 0;
  }
}
</style>
