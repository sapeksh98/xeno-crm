import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCampaign, getCampaignAnalytics, getAIInsights, sendCampaign } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [id])

  const fetchData = async () => {
  try {
    const [campRes, analyticsRes] = await Promise.all([
      getCampaign(id),
      getCampaignAnalytics(id)
    ])
    setCampaign(campRes.data)
    if (analyticsRes.data?.funnel?.sent > 0) {
      setAnalytics(analyticsRes.data)
    }
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const fetchInsights = async () => {
    try {
      const res = await getAIInsights(id)
      setInsights(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async () => {
    setSending(true)
    try {
      await sendCampaign(id)
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Loading campaign...</p>
    </div>
  )

  if (!campaign) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Campaign not found</p>
      <button onClick={() => navigate('/campaigns')} className="mt-4 text-blue-600">
        Back to Campaigns
      </button>
    </div>
  )

  const funnel = analytics?.funnel || {}
  const rates = analytics?.rates || {}

  const funnelData = [
    { name: 'Sent', value: funnel.sent || 0, color: '#3B82F6' },
    { name: 'Delivered', value: funnel.delivered || 0, color: '#8B5CF6' },
    { name: 'Opened', value: funnel.opened || 0, color: '#F59E0B' },
    { name: 'Clicked', value: funnel.clicked || 0, color: '#10B981' },
    { name: 'Purchased', value: funnel.purchased || 0, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 block"
          >
            ← Back to Campaigns
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{campaign.goal}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            campaign.status === 'launched' ? 'bg-green-100 text-green-700' :
            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {campaign.status}
          </span>
          {campaign.status === 'launched' && funnel.sent === 0 && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {sending ? 'Sending...' : '📤 Send Messages'}
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{campaign.audience_count}</p>
          <p className="text-sm text-gray-500 mt-1">Audience</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600 capitalize">{campaign.channel}</p>
          <p className="text-sm text-gray-500 mt-1">Channel</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            ₹{(campaign.predicted_revenue || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Predicted Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            ₹{(campaign.actual_revenue || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Actual Revenue</p>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Funnel</h2>
        {funnel.sent > 0 ? (
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
            <p>No data yet — send the campaign to see funnel stats</p>
          </div>
        )}
      </div>

      {/* Rates */}
      {funnel.sent > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Delivery Rate', value: rates.delivery_rate },
            { label: 'Open Rate', value: rates.open_rate },
            { label: 'Click Rate', value: rates.click_rate },
            { label: 'Purchase Rate', value: rates.purchase_rate },
          ].map(rate => (
            <div key={rate.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{rate.value || 0}%</p>
              <p className="text-sm text-gray-500 mt-1">{rate.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Message Template */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Message Template</h2>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-gray-800 text-sm">
          {campaign.message_template}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <button
            onClick={fetchInsights}
            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium"
          >
            ✨ Generate Insights
          </button>
        </div>
        {insights ? (
          <div className="space-y-3">
            {insights.insights?.map((insight, i) => (
              <div key={i} className="flex gap-3 bg-blue-50 rounded-xl p-4">
                <span className="text-blue-500 font-bold">💡</span>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
            {insights.retargeting_advice && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                <p className="text-sm font-semibold text-orange-700 mb-1">Retargeting Advice</p>
                <p className="text-sm text-gray-700">{insights.retargeting_advice}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Click "Generate Insights" to get AI-powered analysis of this campaign.
          </p>
        )}
      </div>

    </div>
  )
}