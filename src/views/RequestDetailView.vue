<template>
  <Navbar />

  <Breadcrumb :items="[
    { text: 'Home', to: '/' },
    { text: 'Detail Request', active: true }
  ]" />

  <div class="main-content py-4">
    <button class="btn btn-link mb-3" @click="goBack">← Kembali</button>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="request">
      <h1 class="mb-4">Detail Request Penukaran</h1>

      <!-- Sender & Owner Info -->
      <div class="row align-items-center mb-4">
        <div class="col-auto text-center">
          <img
            :src="request.sender.avatarUrl || defaultAvatar"
            width="80" height="80"
            class="rounded-circle"
          />
          <p class="mt-2 mb-0"><strong>{{ request.sender.username }}</strong></p>
          <small class="text-muted">{{ request.sender.email }}</small>
        </div>
        <div class="col-auto text-center ms-4">
          <img
            :src="request.owner.avatarUrl || defaultAvatar"
            width="80" height="80"
            class="rounded-circle"
          />
          <p class="mt-2 mb-0"><strong>{{ request.owner.username }}</strong></p>
          <small class="text-muted">{{ request.owner.email }}</small>
        </div>
        <div class="col text-end">
          <p class="mb-1">
            Dikirim pada: {{ formatDate(request.createdAt) }}
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
        <strong>Lokasi / Alamat:</strong>
        {{ request.location || '–' }}
      </p>
      <p>
        <strong>Waktu:</strong>
        {{ request.date }} {{ request.time }}
      </p>

      <!-- Action Buttons (Hanya Requester yang bisa aksi dan kontak WA owner) -->
      <div class="d-flex gap-2 mt-4">
        <!-- Requester sees Accept / Decline when pending -->
        <template v-if="currentUserId === request.senderId && request.status === 'pending'">
          <button class="btn btn-success" @click="respond('accepted')">Terima</button>
          <button class="btn btn-danger"  @click="respond('declined')">Tolak</button>
        </template>
        <!-- Requester sees “Selesai” when already accepted -->
        <button
          v-if="currentUserId === request.senderId && request.status === 'accepted'"
          class="btn btn-primary"
          @click="respond('completed')"
        >
          Selesai
        </button>
        <!-- Requester can chat WA ke owner -->
        <a
          v-if="currentUserId === request.senderId && request.owner.whatsappNumber"
          :href="`https://wa.me/${request.owner.whatsappNumber}`"
          target="_blank"
          class="btn btn-success"
        >
          Chat WA ke Owner
        </a>

        <button
          v-if="request.status === 'pending'"
          class="btn btn-sm btn-outline-primary me-2"
          @click="goEdit(f.id)"
        >
          Edit
        </button>
        <button
          class="btn btn-sm btn-outline-danger"
          @click="deleteHistory(f.id)"
        >
          Hapus
        </button>
      </div>
    </div>

    <div v-else class="text-center text-muted py-5">
      Request tidak ditemukan.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layouts/Navbar.vue'
import Breadcrumb from '@/components/commons/Breadcrumb.vue'
import api from '@/services/api.js'

const props = defineProps({
  id: { type: [String, Number], required: true }
})
const router        = useRouter()
const request       = ref(null)
const loading       = ref(true)
const currentUserId = ref(null)
const defaultCover  = 'https://ui-avatars.com/api/?name=No+Cover'
const defaultAvatar = 'https://ui-avatars.com/api/?name=User'

function formatDate(ts) {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('id-ID', { day: 'numeric', month:'short', year:'numeric' }) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )
}

function statusClass(s) {
  if (s === 'accepted') return 'bg-success'
  if (s === 'declined') return 'bg-danger'
  return 'bg-warning text-dark'
}

async function respond(action) {
  try {
    await api.updateExchangeStatus(request.value.id, action)
    request.value.status = action
  } catch (err) {
    console.error('Gagal merespon:', err)
  }
}

function goBack() {
  router.back()
}

function goEdit(b) {
  router.push({ name:'book-edit-swap', params:{ id: b.id }})
}



onMounted(async () => {
  try {
    // Ambil profil user
    const profile = await api.getProfile()
    currentUserId.value = profile.data.data.id

    // Fetch semua exchange
    const { exchanges: rec }  = await api.getReceivedExchanges()
    const { exchanges: sent } = await api.getMyExchangeRequests()
    const all = [...rec, ...sent]
    const idNum = Number(props.id)
    const f     = all.find(e => e.id === idNum)

    if (!f) {
      router.replace({ name: 'request-list' })
      return
    }

    // guard data requester & owner
    const requester = f.requester || {}
    const owner     = f.owner     || {}

    request.value = {
      id:        f.id,
      senderId:  requester.id,   // Penanda siapa requester
      ownerId:   owner.id,       // Penanda siapa owner
      sender: {
        username:       requester.username || '–',
        email:          requester.email    || '–',
        whatsappNumber: requester.whatsappNumber || '',
        avatarUrl:      requester.avatarUrl      || defaultAvatar
      },
      owner: {
        username:       owner.username || '–',
        email:          owner.email    || '–',
        whatsappNumber: owner.whatsappNumber || '',
        avatarUrl:      owner.avatarUrl      || defaultAvatar
      },
      requestedBook: {
        ...f.requestedBook,
        coverUrl: f.requestedBook.imageUrl || defaultCover
      },
      offeredBook: {
        ...f.offeredBook,
        coverUrl: f.offeredBook.imageUrl || defaultCover
      },
      message:    f.messages || '',
      location:   f.location || '',
      date:       f.meetingDatetime?.slice(0,10) || '',
      time:       f.meetingDatetime?.slice(11,16) || '',
      createdAt:  f.createdAt,
      status:     f.status
    }
  } catch (err) {
    console.error('Error di mounted hook:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.main-content {
  padding-bottom: 2rem;
}
</style>
