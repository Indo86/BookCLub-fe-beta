<template>
  <Navbar/>
  <Breadcrumb :items="[
    { text:'Home', to:'/' },
    { text:'Books', to:'/books' },
    { text:'Exchange', active:true }
  ]"/>

  <div class="main-content py-4">
    <h2 class="mb-4">Tukar Buku</h2>
    <div class="row">
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
          title="Pilih Buku Milik Anda"
          empty-message="Anda tidak memiliki buku 'available' untuk ditukar."
          mode="create"
          submit-button-text="Kirim Request"
          @submit="handleSubmitRequest"
          @book-selected="handleBookSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layouts/Navbar.vue'
import Breadcrumb from '@/components/commons/Breadcrumb.vue'
import SwapForm from '@/components/Form/SwapForm.vue'
import api from '@/services/api.js'

const route = useRoute()
const router = useRouter()
const bookId = Number(route.query.bookId)

const targetBook = ref({})
const myBooks = ref([])
const selectedBookId = ref(null)

onMounted(async () => {
  try {
    // Detail buku target
    const { book } = await api.getBookDetail(bookId)
    targetBook.value = {
      ...book,
      coverUrl: book.imageUrl || 'https://ui-avatars.com/api/?name=No+Cover'
    }

    // Buku milik user yang available (kecuali target)
    const { books } = await api.getMyBooks()
    const own = books.map(b => ({
      ...b,
      coverUrl: b.imageUrl || 'https://ui-avatars.com/api/?name=No+Cover'
    }))
    myBooks.value = own.filter(b => b.id !== bookId && b.status === 'available')

  } catch (e) {
    console.error(e)
    alert('Gagal mengambil data buku.')
  }
})

const handleBookSelected = (bookId) => {
  selectedBookId.value = bookId
}

const handleSubmitRequest = async (formData) => {
  try {
    await api.requestExchange({
      offeredBookId: formData.selectedBookId,
      requestedBookId: bookId,
      messages: formData.message,
      method: formData.method,
      location: formData.location,
      address: formData.address,
      meetingDatetime: formData.meetingDatetime
    })
    alert('Request terkirim.')
    router.push({ name: 'profile', query: { tab: 'history' } })
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'Gagal kirim request.')
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>