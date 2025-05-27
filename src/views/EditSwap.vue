<template>
  <Navbar/>
  <Breadcrumb :items="[
    { text:'Home', to:'/' },
    { text:'Books', to:'/books' },
    { text:'Edit Exchange', active:true }
  ]"/>
  
  <div class="main-content py-4">
    <h2 class="mb-4">Edit Request Pertukaran</h2>
    
    <div v-if="!loaded" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else>
      <!-- Jika bukan 'pending', redirect atau inform -->
      <div v-if="request.status !== 'pending'" class="alert alert-warning">
        Hanya request dengan status <strong>pending</strong> yang bisa diedit.
      </div>
      
      <div v-else class="row">
        <!-- Target Book -->
        <div class="col-md-4 text-center">
          <img
            :src="targetBook.coverUrl"
            class="img-fluid rounded shadow-sm mb-3"
          />
          <h5>{{ targetBook.title }}</h5>
          <p class="text-muted">by {{ targetBook.author }}</p>
        </div>
        
        <!-- Swap Form -->
        <div class="col-md-8">
          <SwapForm
            :books="myBooks"
            title="Pilih Ulang Buku Anda"
            empty-message="Tidak ada buku yang tersedia untuk ditukar."
            mode="edit"
            :initial-data="initialFormData"
            :show-cancel-button="true"
            submit-button-text="Simpan Perubahan"
            cancel-button-text="Batal"
            @submit="handleSubmitEdit"
            @cancel="handleCancel"
            @book-selected="handleBookSelected"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layouts/Navbar.vue'
import Breadcrumb from '@/components/commons/Breadcrumb.vue'
import SwapForm from '@/components/Form/SwapForm.vue'
import api from '@/services/api.js'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const request = ref(null)
const loaded = ref(false)
const targetBook = ref({})
const myBooks = ref([])
const selectedBookId = ref(null)

// Computed property untuk initial data form
const initialFormData = computed(() => {
  if (!request.value) return {}
  
  return {
    selectedBookId: request.value.offeredBook?.id || null,
    message: request.value.messages || '',
    method: request.value.method || 'meet',
    location: request.value.location || '',
    address: request.value.address || '',
    date: request.value.meetingDatetime ? request.value.meetingDatetime.slice(0, 10) : '',
    time: request.value.meetingDatetime ? request.value.meetingDatetime.slice(11, 16) : ''
  }
})

onMounted(async () => {
  try {
    // Fetch detail exchange
    const { data } = await api.getExchangeDetail(id)
    request.value = data
    
    if (data.status !== 'pending') {
      loaded.value = true
      return
    }

    // Target book
    targetBook.value = {
      ...data.requestedBook,
      coverUrl: data.requestedBook.imageUrl || 'https://ui-avatars.com/api/?name=No+Cover'
    }

    // Buku user: include current offered + available
    const { books } = await api.getMyBooks()
    myBooks.value = books
      .filter(b => b.status === 'available' || b.id === data.offeredBook.id)
      .map(b => ({
        ...b,
        coverUrl: b.imageUrl || 'https://ui-avatars.com/api/?name=No+Cover'
      }))

    loaded.value = true
  } catch (e) {
    console.error(e)
    alert('Gagal load data.')
    router.back()
  }
})

const handleBookSelected = (bookId) => {
  selectedBookId.value = bookId
}

const handleSubmitEdit = async (formData) => {
  try {
    await api.updateExchange(id, {
      offeredBookId: formData.selectedBookId,
      messages: formData.message,
      method: formData.method,
      location: formData.location,
      address: formData.address,
      meetingDatetime: formData.meetingDatetime
    })
    alert('Request berhasil diperbarui.')
    router.push({ name: 'profile', query: { tab: 'history' } })
  } catch (e) {
    console.error(e)
    alert('Gagal memperbarui request.')
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
/* Custom styles if needed */
</style>