<script setup>
  import { ref, onMounted, defineProps } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import Navbar     from '@/components/layouts/Navbar.vue'
  import Breadcrumb from '@/components/commons/Breadcrumb.vue'
  import api        from '@/services/api.js'

  // deklarasi prop id
  const props  = defineProps({ id: [ String, Number ] })
  const route  = useRoute()
  const router = useRouter()

  const book            = ref(null)
  const owner           = ref({})
  const currentUserId   = ref(null)
  const loading         = ref(true)
  const error           = ref(null)

  const defaultCover    = 'https://via.placeholder.com/300x400?text=No+Cover'
  const defaultAvatar   = 'https://via.placeholder.com/48?text=Avatar'

  onMounted(async () => {
    try {
      // ambil profil
      const p = await api.getProfile()
      currentUserId.value = p.data.data.id

      // ambil detail buku
      const id = Number(props.id)    // or route.params.id if you prefer
      const { book: b } = await api.getBookDetail(id)
      book.value        = { ...b, coverUrl: b.imageUrl }
      owner.value       = b.owner || {}
    } catch (e) {
      console.error(e)
      error.value = 'Gagal ambil detail buku.'
    } finally {
      loading.value = false
    }
  })

  function requestExchange() {
    router.push({ name: 'books-swap', query: { bookId: book.value.id } })
  }
</script>


<template>
  <Navbar/>

  <div class="main-content py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <Breadcrumb
        :items="[
          { text:'Home', to:'/' },
          { text:'Books', to:'/books' },
          { text:book.title, active:true }
        ]"
      />

      <div class="row">
        <div class="col-md-4 text-center">
          <img
            :src="book.coverUrl || defaultCover"
            class="img-fluid rounded shadow-sm mb-3"
          />
        </div>
        <div class="col-md-8">
          <h2 class="mb-2">{{ book.title }}</h2>
          <p class="text-muted mb-1">by {{ book.author }}</p>
          <p class="mb-2">
            <strong>Genre:</strong> {{ book.genre }}
            <span class="mx-2">|</span>
            <strong>Kondisi:</strong> {{ book.condition }}
          </p>
          <hr/>
          <p class="text-justify">{{ book.description }}</p>

          <div class="d-flex align-items-center mt-4">
            <img
              :src="owner.avatar_url || defaultAvatar"
              width="48" height="48"
              class="rounded-circle me-2"
            />
            <div>
              <p class="mb-0">
                <strong>Owner:</strong> {{ owner.username || owner.name }}
              </p>
              <small class="text-muted">{{ owner.email }}</small>
            </div>
          </div>

             <button
            v-if="currentUserId !== owner.id"
            class="btn btn-primary mt-4"
            @click="requestExchange"
          >
             <i class="bi bi-arrow-left-right me-1"></i>
             Tukar Buku
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* pakai Bootstrap saja */
</style>
