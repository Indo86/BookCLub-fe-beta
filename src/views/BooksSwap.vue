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
      <!-- target book -->
      <div class="col-md-4 text-center">
        <img :src="targetBook.coverUrl" class="img-fluid rounded shadow-sm mb-3"/>
        <h5>{{ targetBook.title }}</h5>
        <p class="text-muted">by {{ targetBook.author }}</p>
      </div>
      <!-- pilih milik sendiri -->
      <div class="col-md-8">
        <h5>Pilih Buku Milik Anda</h5>
        <div class="row g-3">
          <!-- no longer filtering here; myBooks is already only available ones -->
          <div v-for="b in myBooks" :key="b.id" class="col-sm-6 col-lg-4">
            <label
              class="card h-100 cursor-pointer"
              :class="{ 'border-primary': selectedId === b.id }"
            >
              <input
                type="radio"
                v-model="selectedId"
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
          <div v-if="myBooks.length === 0" class="col-12 text-center text-muted">
            Anda tidak memiliki buku “available” untuk ditukar.
          </div>
        </div>

        <!-- hanya tampilkan form kalau ada buku yg bisa dipilih -->
        <div v-if="myBooks.length" class="exchange-form mt-4">
          <!-- ... rest of your form unchanged ... -->
          <div class="mb-3">
            <label class="form-label">Pesan untuk Pemilik</label>
            <textarea
              v-model="form.message"
              class="form-control"
              rows="3"
              placeholder="Tulis pesan singkat…"
            />
          </div>
          <!-- metode, alamat/lokasi, tanggal & waktu... -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="form-label">Tanggal</label>
              <input v-model="form.date" type="date" class="form-control"/>
            </div>
            <div class="col-md-6">
              <label class="form-label">Waktu</label>
              <input v-model="form.time" type="time" class="form-control"/>
            </div>
          </div>
          <button class="btn btn-success" @click="submitRequest">
            Kirim Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layouts/Navbar.vue'
import Breadcrumb from '@/components/commons/Breadcrumb.vue'
import api from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const form = reactive({
  message: '',
  method: 'meet',
  address: '',
  location: '',
  date: '',
  time: ''
})
const targetBook = ref({})
const myBooks = ref([])       // will hold only available books
const selectedId = ref(null)
const bookId = Number(route.query.bookId)

onMounted(async () => {
  try {
    // ambil detail buku target
    const { book } = await api.getBookDetail(bookId)
    targetBook.value = { ...book, coverUrl: book.imageUrl }

    // ambil semua buku milik user & hanya yang status='available'
    const { books } = await api.getMyBooks()
    const own = books.map(b => ({
      ...b,
      coverUrl: b.imageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'
    }))
    const available = own.filter(b => b.id !== bookId && b.status === 'available')
    myBooks.value = available

    // pilih buku pertama (jika ada)
    if (available.length) {
      selectedId.value = available[0].id
    }
  } catch (e) {
    console.error(e)
    alert('Gagal mengambil data buku.')
  }
})

async function submitRequest() {
  if (!selectedId.value) {
    return alert('Pilih buku Anda yang “available” terlebih dahulu.')
  }
  if (!form.date || !form.time) {
    return alert('Pilih tanggal & waktu.')
  }
  try {
    await api.requestExchange({
      offeredBookId: selectedId.value,
      requestedBookId: bookId,
      messages: form.message,
      method: form.method,
      location: form.method === 'meet' ? form.location : undefined,
      address: form.method === 'delivery' ? form.address : undefined,
      meetingDatetime: `${form.date}T${form.time}`
    })
    alert('Request terkirim.')
    router.push({ name: 'home' })
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'Gagal kirim request.')
  }
}
</script>

<style scoped>
.card { cursor: pointer; transition: border-color .2s }
.card.border-primary { border-width: 2px !important }
</style>
