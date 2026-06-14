import { useState, useEffect } from 'react'
import { getCustomers, getCustomerCount, uploadCustomers } from '../lib/api'
export default function Customers() {
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [customers, setCustomers] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    city: '',
    min_spending: '',
    inactive_days: '',
    min_age: '',
    max_age: '',
    limit: 50
  })

  const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow']

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.city) params.city = filters.city
      if (filters.min_spending) params.min_spending = filters.min_spending
      if (filters.inactive_days) params.inactive_days = filters.inactive_days
      if (filters.min_age) params.min_age = filters.min_age
      if (filters.max_age) params.max_age = filters.max_age
      params.limit = filters.limit

      const [custRes, countRes] = await Promise.all([
        getCustomers(params),
        getCustomerCount(params)
      ])
      setCustomers(custRes.data)
      setCount(countRes.data.count)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const res = await uploadCustomers(file)
      setUploadMsg(`✅ ${res.data.customers_created} customers imported successfully`)
      fetchCustomers()
    } catch (err) {
      setUploadMsg('❌ Upload failed. Check CSV format.')
    } finally {
      setUploading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchCustomers()
  }

  const handleReset = () => {
    setFilters({ city: '', min_spending: '', inactive_days: '', min_age: '', max_age: '', limit: 50 })
    setTimeout(fetchCustomers, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing {customers.length} of {count} matching customers
        </p>
      </div>

      {/* CSV Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Import Customers</h2>
            <p className="text-xs text-gray-400 mt-1">
              CSV format: name, email, phone, city, age, total_spending
            </p>
          </div>
          <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium ${uploading ? 'opacity-50' : ''}`}>
            {uploading ? '⏳ Uploading...' : '📁 Upload CSV'}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {uploadMsg && (
          <p className="mt-3 text-sm text-green-600">{uploadMsg}</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Filter Customers</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">City</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Spending (₹)</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 5000"
              value={filters.min_spending}
              onChange={(e) => handleFilterChange('min_spending', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Inactive Days</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 60"
              value={filters.inactive_days}
              onChange={(e) => handleFilterChange('inactive_days', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Age</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 20"
              value={filters.min_age}
              onChange={(e) => handleFilterChange('min_age', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Age</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 35"
              value={filters.max_age}
              onChange={(e) => handleFilterChange('max_age', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Show</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value={25}>25 customers</option>
              <option value={50}>50 customers</option>
              <option value={100}>100 customers</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            🔍 Search
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Age</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spending</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Purchase</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer, i) => (
                <tr key={customer.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.age}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    ₹{customer.total_spending?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.last_purchase_date
                      ? new Date(customer.last_purchase_date).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}