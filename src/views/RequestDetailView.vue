<template>
  <Navbar/>
  <Breadcrumb :items="[
    { text:'Home', to:'/' },
    { text:'Detail Request', active:true }
  ]"/>

  <div class="main-content py-4">
    <button class="btn btn-link mb-3" @click="goBack">← Kembali</button>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="request">
      <h1 class="mb-4">Detail Request Penukaran</h1>
      <!-- Sender Info -->
      <div class="row align-items-center mb-4">
        <div class="col-auto text-center">
          <img
            :src="request.sender.avatarUrl || defaultAvatar"
            width="80" height="80"
            class="rounded-circle"
          />
          <p class="mt-2 mb-0">
            <strong>{{ request.sender.username || request.sender.name }}</strong>
          </p>
          <small class="text-muted">{{ request.sender.email }}</small>
        </div>
        <div class="col">
          <p class="mb-1">
            Dikirim pada: {{ formatDate(request.created_at) }}
          </p>
          <span class="badge" :class="statusClass(request.status)">
            {{ request.status }}
          </span>
        </div>
      </div>

      <!-- Requested Book -->
      <h5>Buku Diminta</h5>
      <div class="card mb-3 p-3">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <img
              :src="request.requestedBook.coverUrl || defaultCover"
              width="100"
              class="img-fluid rounded"
            />
          </div>
          <div class="col">
            <h6 class="mb-1">{{ request.requestedBook.title }}</h6>
            <p class="text-muted mb-0">by {{ request.requestedBook.author }}</p>
          </div>
        </div>
      </div>

      <!-- Offered Book -->
      <h5>Buku Ditawarkan</h5>
      <div class="card mb-3 p-3">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <img
              :src="request.offeredBook.coverUrl || defaultCover"
              width="100"
              class="img-fluid rounded"
            />
          </div>
          <div class="col">
            <h6 class="mb-1">{{ request.offeredBook.title }}</h6>
            <p class="text-muted mb-0">by {{ request.offeredBook.author }}</p>
          </div>
        </div>
      </div>

      <!-- Message -->
      <h5>Pesan</h5>
      <p class="mb-4">{{ request.message }}</p>

      <!-- Exchange Details -->
      <h5>Detail Pertukaran</h5>
      <p>
        <strong>Metode:</strong>
        {{ request.method === 'meet' ? 'Ketemuan' : 'Kirim Kurir' }}
      </p>
      <p>
        <strong>{{ request.method === 'meet' ? 'Lokasi' : 'Alamat' }}:</strong>
        {{ request.location }}
      </p>
      <p><strong>Waktu:</strong> {{ request.date }} {{ request.time }}</p>

      <!-- Action Buttons -->
      <div v-if="request.status === 'pending'" class="mb-5">
        <button class="btn btn-success me-2" @click="accept">Terima</button>
        <button class="btn btn-danger" @click="decline">Tolak</button>
      </div>
    </div>

    <div v-else class="text-center text-muted py-5">
      Request tidak ditemukan.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {useRouter } from 'vue-router'
import Navbar from '@/components/layouts/Navbar.vue'
import Breadcrumb from '@/components/commons/Breadcrumb.vue'
import api from '@/services/api.js'

const props = defineProps({
  id: { type: [String, Number], required: true }
})
const router = useRouter()

const request = ref(null)
const loading = ref(true)
const defaultCover  = 'https://via.placeholder.com/300x400?text=No+Cover'
const defaultAvatar = 'https://via.placeholder.com/80?text=Avatar'

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('id-ID', { day:'numeric',month:'short',year:'numeric' })
    + ' ' +
    d.toLocaleTimeString('id-ID', { hour:'2-digit',minute:'2-digit' })
}

function statusClass(s) {
  if (s === 'accepted') return 'bg-success'
  if (s === 'declined') return 'bg-danger'
  return 'bg-warning text-dark'
}

async function accept() {
  await api.updateExchangeStatus(request.value.id, 'accepted')
  request.value.status = 'accepted'
}

async function decline() {
  await api.updateExchangeStatus(request.value.id, 'declined')
  request.value.status = 'declined'
}

function goBack() {
  router.back()
}

onMounted(async () => {
  const idNum = Number(props.id)
  try {
    const { exchanges: rec }  = await api.getReceivedExchanges()
    const { exchanges: sent } = await api.getMyExchangeRequests()
    const all = [...rec, ...sent]
    const f = all.find(e => e.id === idNum)
    if (!f) {
      // redirect to list if not found
      return router.replace({ name: 'request-list' })
    }
    // ensure coverUrl fields exist
    f.requestedBook.coverUrl = f.requestedBook.imageUrl
    f.offeredBook.coverUrl   = f.offeredBook.imageUrl

    request.value = {
      id: f.id,
      sender: f.requester || f.owner,
      requestedBook: f.requestedBook,
      offeredBook:   f.offeredBook,
      message:       f.messages || '',
      method:        f.location ? 'meet' : 'delivery',
      location:      f.location || f.address || '',
      date:          f.meetingDatetime?.slice(0,10) || '',
      time:          f.meetingDatetime?.slice(11,16) || '',
      created_at:    f.createdAt,
      status:        f.status
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.main-content { padding-bottom: 2rem; }
</style>
