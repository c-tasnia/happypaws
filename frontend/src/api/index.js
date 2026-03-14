import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const donationsAPI = {
  // GET all pets (for the pet selector)
  getPets: () => api.get('/pets'),

  // POST initiate SSLCommerz — returns { payment_url }
  initiate: (data) => api.post('/donate/pay', data),

  // GET verify after redirect — returns donation details
  verify: (tran_id) => api.get(`/donate/verify/${tran_id}`),

  // GET recent donations for the live feed
  recent: () => api.get('/donations/recent'),
}

export default api
