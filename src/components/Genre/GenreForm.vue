<template>
  <div class="genre-form">
    <form @submit.prevent="onSubmit">
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

      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">
          {{ mode === 'add' ? 'Thêm' : 'Lưu' }}
        </button>
        <button type="button" class="btn" @click="$emit('cancel')">Hủy</button>
      </div>
    </form>
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
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
}
.modal-actions {
  text-align: right;
  margin-top: 1rem;
}
.btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #e9ecef;
  color: #2c3e50;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 1rem;
}
.btn-primary {
  background: linear-gradient(135deg, #e8c5c1 0%, #c9a9a6 100%);
  color: #fff;
}
</style>
