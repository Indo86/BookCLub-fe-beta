<template>
  <div class="swap-form">
    <!-- Pilihan Buku -->
    <h5>{{ title }}</h5>
    <div class="row g-3 mb-4">
      <div
        v-for="b in books"
        :key="b.id"
        class="col-sm-6 col-lg-4"
      >
        <label
          class="card h-100 cursor-pointer"
          :class="{ 'border-primary': selectedBookId === b.id }"
        >
          <input
            type="radio"
            v-model="selectedBookId"
            :value="b.id"
            class="visually-hidden"
          />
          <img :src="b.coverUrl" class="card-img-top"/>
          <div class="card-body">
            <h6 class="card-title mb-1">{{ b.title }}</h6>
            <p class="text-muted small">{{ b.author }}</p>
          </div>
        </label>
      </div>
      <div
        v-if="books.length === 0"
        class="col-12 text-center text-muted"
      >
        {{ emptyMessage }}
      </div>
    </div>

    <!-- Form Detail Pertukaran -->
    <div v-if="books.length" class="exchange-form">
      <!-- Pesan -->
      <div class="mb-3">
        <label class="form-label">Pesan untuk Pemilik</label>
        <textarea
          v-model="formData.message"
          class="form-control"
          rows="3"
          placeholder="Tulis pesan singkat…"
        />
      </div>

      <!-- Metode Pertukaran -->
      <div class="mb-3">
        <label class="form-label">Metode Pertukaran</label>
        <div>
          <div class="form-check form-check-inline">
            <input
              v-model="formData.method"
              type="radio"
              :id="`meet-${componentId}`"
              value="meet"
              class="form-check-input"
            />
            <label class="form-check-label" :for="`meet-${componentId}`">Ketemuan</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              v-model="formData.method"
              type="radio"
              :id="`delivery-${componentId}`"
              value="delivery"
              class="form-check-input"
            />
            <label class="form-check-label" :for="`delivery-${componentId}`">Kirim Kurir</label>
          </div>
        </div>
      </div>

      <!-- Lokasi / Alamat -->
      <div v-if="formData.method === 'delivery'" class="mb-3">
        <label class="form-label">Alamat Pengiriman</label>
        <input
          v-model="formData.address"
          type="text"
          class="form-control"
          placeholder="Alamat lengkap…"
        />
      </div>
      <div v-else class="mb-3">
        <label class="form-label">Lokasi Pertemuan</label>
        <input
          v-model="formData.location"
          type="text"
          class="form-control"
          placeholder="Contoh: Kedai Kopi XYZ"
        />
      </div>

      <!-- Tanggal & Waktu -->
      <div class="row mb-4">
        <div class="col-md-6">
          <label class="form-label">Tanggal</label>
          <input v-model="formData.date" type="date" class="form-control"/>
        </div>
        <div class="col-md-6">
          <label class="form-label">Waktu</label>
          <input v-model="formData.time" type="time" class="form-control"/>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2">
        <button 
          class="btn btn-success" 
          :class="{ 'btn-primary': mode === 'edit' }"
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          {{ submitButtonText }}
        </button>
        <button 
          v-if="showCancelButton" 
          class="btn btn-secondary" 
          @click="handleCancel"
        >
          {{ cancelButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  books: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Pilih Buku Milik Anda'
  },
  emptyMessage: {
    type: String,
    default: 'Anda tidak memiliki buku "available" untuk ditukar.'
  },
  mode: {
    type: String,
    default: 'create', // 'create' atau 'edit'
    validator: (value) => ['create', 'edit'].includes(value)
  },
  initialData: {
    type: Object,
    default: () => ({
      selectedBookId: null,
      message: '',
      method: 'meet',
      address: '',
      location: '',
      date: '',
      time: ''
    })
  },
  showCancelButton: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: ''
  },
  cancelButtonText: {
    type: String,
    default: 'Batal'
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel', 'book-selected'])

// Data
const componentId = ref(`swap-form-${Math.random().toString(36).substr(2, 9)}`)
const selectedBookId = ref(null)
const formData = ref({
  message: '',
  method: 'meet',
  address: '',
  location: '',
  date: '',
  time: ''
})

// Computed
const submitButtonTextComputed = computed(() => {
  if (props.submitButtonText) return props.submitButtonText
  return props.mode === 'edit' ? 'Simpan Perubahan' : 'Kirim Request'
})

const isFormValid = computed(() => {
  return selectedBookId.value && 
         formData.value.date && 
         formData.value.time &&
         (formData.value.method === 'meet' ? formData.value.location : formData.value.address)
})

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    selectedBookId.value = newData.selectedBookId
    formData.value = {
      message: newData.message || '',
      method: newData.method || 'meet',
      address: newData.address || '',
      location: newData.location || '',
      date: newData.date || '',
      time: newData.time || ''
    }
  }
}, { immediate: true, deep: true })

watch(selectedBookId, (newValue) => {
  emit('book-selected', newValue)
})

// Methods
const handleSubmit = () => {
  if (!isFormValid.value) {
    if (!selectedBookId.value) {
      alert('Pilih buku Anda terlebih dahulu.')
      return
    }
    if (!formData.value.date || !formData.value.time) {
      alert('Pilih tanggal & waktu.')
      return
    }
    if (formData.value.method === 'meet' && !formData.value.location) {
      alert('Masukkan lokasi pertemuan.')
      return
    }
    if (formData.value.method === 'delivery' && !formData.value.address) {
      alert('Masukkan alamat pengiriman.')
      return
    }
    return
  }

  const submitData = {
    selectedBookId: selectedBookId.value,
    message: formData.value.message,
    method: formData.value.method,
    location: formData.value.method === 'meet' ? formData.value.location : undefined,
    address: formData.value.method === 'delivery' ? formData.value.address : undefined,
    meetingDatetime: `${formData.value.date}T${formData.value.time}`
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}

// Auto-select first book if available and no initial selection
onMounted(() => {
  if (props.books.length > 0 && !selectedBookId.value && props.mode === 'create') {
    selectedBookId.value = props.books[0].id
  }
})
</script>

<style scoped>
.card { 
  cursor: pointer; 
  transition: border-color .2s; 
}

.card.border-primary { 
  border-width: 2px !important; 
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.exchange-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>