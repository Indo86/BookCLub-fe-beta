import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// axios instance
const apiInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// attach token if ada
const initialToken = localStorage.getItem('accessToken')
if (initialToken) {
  apiInstance.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`
}

// auto‐refresh on 401
apiInstance.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        const { data } = await axios.get(`${API_URL}/token/refresh`, { withCredentials: true })
        localStorage.setItem('accessToken', data.accessToken)
        apiInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        err.config.headers['Authorization'] = `Bearer ${data.accessToken}`
        return apiInstance(err.config)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

const api = {
  // ── Auth ───────────────────────────────────────────────────────
  register(userData)      { return apiInstance.post('/auth/register', userData) },
  login(userData) {
    return apiInstance.post('/auth/login', userData)
      .then(res => {
        const token = res.data.token || res.data.accessToken
        localStorage.setItem('accessToken', token)
        apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
        return res
      })
  },
  logout() {
    return apiInstance.post('/auth/logout')
      .then(res => {
        localStorage.removeItem('accessToken')
        delete apiInstance.defaults.headers.common['Authorization']
        window.location.href = '/login'
        return res
      })
  },

  // ── Users ─────────────────────────────────────────────────────
  getUsers()          { return apiInstance.get('/users') },
  getUserById(id)     { return apiInstance.get(`/users/${id}`) },
  createUser(data)    { return apiInstance.post('/users', data) },
  updateUser(id,data) { return apiInstance.put(`/users/${id}`, data) },
  deleteUser(id)      { return apiInstance.delete(`/users/${id}`) },

  getProfile()        { return apiInstance.get('/users/profile') },
  updateProfile(data) { return apiInstance.put('/users/profile/update', data) },
  changePassword(o,n) { return apiInstance.put('/users/profile/change-password', { oldPassword:o, newPassword:n }) },

  // ── Books ─────────────────────────────────────────────────
  async getAllBooks() {
    const res = await apiInstance.get('/books')
    return { books: res.data.data }
  },
  async getMyBooks() {
    const res = await apiInstance.get('/books/me')
    return { books: res.data.data }
  },
  async getBookDetail(id) {
    const res = await apiInstance.get(`/books/${id}`)
    return { book: res.data.data }
  },
  addBook(bookData) {
    return apiInstance.post('/books', bookData)
  },
  updateBook(id, data) {
    return apiInstance.put(`/books/${id}`, data)
  },
  deleteBook(id) {
    return apiInstance.delete(`/books/${id}`)
  },

  // ── Exchanges ─────────────────────────────────────────────
  async getReceivedExchanges() {
    const res = await apiInstance.get('/exchanges/received')
    return { exchanges: res.data.data }
  },
  async getMyExchangeRequests() {
    const res = await apiInstance.get('/exchanges/sent')
    return { exchanges: res.data.data }
  },
  requestExchange(payload) {
    return apiInstance.post('/exchanges', payload)
  },
  updateExchangeStatus(id, status) {
    return apiInstance.put(`/exchanges/${id}`, { status })
  },


  // ── History ───────────────────────────────────────────────────
  addExchangeHistory(p)      { return apiInstance.post('/exchanges/history', p) },
  async getAllExchangeHistory() {
    const res = await apiInstance.get('/exchanges/history')
    return { histories: res.data.data }
  },
  async getExchangeHistoryById(id) {
    const res = await apiInstance.get(`/exchanges/history/${id}`)
    return { history: res.data.data }
  },

  // ── Misc ──────────────────────────────────────────────────────
  getProtected() { return apiInstance.get('/protected') },
}

export default api
