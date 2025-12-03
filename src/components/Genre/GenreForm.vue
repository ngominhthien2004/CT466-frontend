<template>
  <div class="form-overlay" @click.self="$emit('cancel')">
    <div class="form-container" style="max-width: 500px;">
      <div class="form-header">
        <h2>
          <i class="fas fa-tags"></i>
          {{ title }}
        </h2>
        <button @click="$emit('cancel')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-body">
          <div class="form-group">
            <label for="genre-name">Tên</label>
            <input
              id="genre-name"
              v-model="local.name"
              @input="onNameInput"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="genre-description">Mô tả</label>
            <textarea
              id="genre-description"
              v-model="local.description"
              autocomplete="off"
            ></textarea>
          </div>

          <!-- slug hidden, kept in local and auto-generated -->
          <input type="hidden" v-model="local.slug" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('cancel')" :disabled="submitting">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button type="submit" class="btn-submit" :disabled="submitting">
            <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            {{ mode === 'add' ? 'Thêm' : 'Lưu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue';

export default {
  name: 'GenreForm',
  props: {
    initial: {
      type: Object,
      default: () => ({ name: '', slug: '', description: '' })
    },
    mode: {
      type: String,
      default: 'add'
    },
    title: {
      type: String,
      default: 'Thể loại'
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const local = reactive({
      name: props.initial.name ?? '',
      slug: props.initial.slug ?? '',
      description: props.initial.description ?? ''
    });

    watch(
      () => props.initial,
      (next) => {
        local.name = next.name ?? '';
        local.slug = next.slug ?? '';
        local.description = next.description ?? '';
      },
      { deep: true, immediate: true }
    );

    function slugify(str) {
      if (!str) return '';
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    function onNameInput() {
      local.slug = slugify(local.name);
    }

    function onSubmit() {
      local.slug = slugify(local.name);
      emit('save', { name: local.name, slug: local.slug, description: local.description });
    }

    return {
      ...toRefs(local),
      local,
      onSubmit,
      onNameInput
    };
  }
};
</script>

<style scoped>
@import '@/assets/form.css';

/* Custom form header styling */
.form-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.form-header h2 {
    margin: 0;
    color: white;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.form-header i {
    color: white;
}

.btn-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.btn-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}
</style>
