import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

export const getCustomers = (filters = {}) => API.get('/customers/', { params: filters })
export const getCustomerCount = (filters = {}) => API.get('/customers/count', { params: filters })

export const getCampaigns = () => API.get('/campaigns/')
export const getCampaign = (id) => API.get(`/campaigns/${id}`)
export const createCampaign = (data) => API.post('/campaigns/', data)
export const launchCampaign = (id) => API.post(`/campaigns/${id}/launch`)
export const deleteCampaign = (id) => API.delete(`/campaigns/${id}`)
export const sendCampaign = (id) => API.post(`/communications/send/${id}`)

export const getAnalytics = () => API.get('/analytics/')
export const getCampaignAnalytics = (id) => API.get(`/analytics/${id}`)

export const createAICampaign = (goal) => API.post('/ai/create-campaign', { goal })
export const getAIInsights = (id) => API.get(`/ai/insights/${id}`)

export const uploadCustomers = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post('/customers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}