import { useState, useEffect } from 'react'
import { getAnalytics, getCampaigns } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [analyticsRes, campaignsRes] = await Promise.all([
        getAnalytics(),
        getCampaigns()
      ])
      setAnalytics(analyticsRes.data)
      setCampaigns(campaignsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Loading analytics...</p>
    </div>
  )

  const funnelData = analytics ? [
    { name: 'Sent', value: analytics.total_sent, color: '#3B82F6' },
    { name: 'Delivered', value: analytics.delivered, color: '#8B5CF6' },
    { name: 'Opened', value: analytics.opened, color: '#F59E0B' },
    { name: 'Clicked', value: analytics.clicked, color: '#10B981' },
    { name: 'Purchased', value: analytics.purchased, color: '#EF4444' },
  ] : []

  const channelData = [
    { name: 'WhatsApp', value: campaigns.filter(c => c.channel === 'whatsapp').length, color: '#25D366' },
    { name: 'SMS', value: campaigns.filter(c => c.channel === 'sms').length, color: '#3B82F6' },
    { name: 'Email', value: campaigns.filter(c => c.channel === 'email').length, color: '#F59E0B' },
  ].filter(d => d.value > 0)

  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.actual_revenue || 0), 0)
  const launchedCampaigns = campaigns.filter(c => c.status === 'launched').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Global Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance across all campaigns</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{campaigns.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Campaigns</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{launchedCampaigns}</p>
          <p className="text-sm text-gray-500 mt-1">Launched</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{analytics?.total_sent || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Messages Sent</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-orange-600">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Delivery Rate', value: analytics?.delivery_rate || 0, color: 'text-blue-600' },
          { label: 'Open Rate', value: analytics?.open_rate || 0, color: 'text-yellow-600' },
          { label: 'Click Rate', value: analytics?.click_rate || 0, color: 'text-green-600' },
          { label: 'Purchase Rate', value: analytics?.purchase_rate || 0, color: 'text-red-600' },
        ].map(rate => (
          <div key={rate.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className={`text-3xl font-bold ${rate.color}`}>{rate.value}%</p>
            <p className="text-sm text-gray-500 mt-1">{rate.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Funnel</h2>
          {analytics?.total_sent > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No campaign data yet</p>
            </div>
          )}
        </div>

        {/* Channel Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h2>
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {channelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No campaigns yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Revenue Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Revenue Breakdown</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Channel</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Audience</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Predicted</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.slice(0, 10).map((campaign, i) => (
              <tr key={campaign.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600 capitalize">{campaign.channel}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'launched' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{campaign.audience_count}</td>
                <td className="px-6 py-3 text-sm text-gray-600">₹{(campaign.predicted_revenue || 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm font-semibold text-green-600">₹{(campaign.actual_revenue || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}