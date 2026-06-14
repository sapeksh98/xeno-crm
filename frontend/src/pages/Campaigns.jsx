import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampaigns, deleteCampaign } from '../lib/api'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
  try {
    const res = await getCampaigns()
    setCampaigns(res.data.reverse())
  } catch (err) {
    console.error(err)
    setError('Could not connect to backend. Make sure server is running on port 8000.')
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)
      fetchCampaigns()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColor = (status) => {
    if (status === 'launched') return 'bg-green-100 text-green-700'
    if (status === 'completed') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const channelEmoji = (channel) => {
    if (channel === 'whatsapp') return '💬'
    if (channel === 'sms') return '📱'
    if (channel === 'email') return '📧'
    return '📨'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Loading campaigns...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">{campaigns.length} total campaigns</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ✨ New AI Campaign
        </button>
      </div>
      {/* Add this line here */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">No campaigns yet</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">{channelEmoji(campaign.channel)}</span>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">{campaign.goal}</p>
                  <div className="flex gap-6 mt-3 ml-8">
                    <div>
                      <span className="text-xs text-gray-400">Audience</span>
                      <p className="text-sm font-semibold text-gray-700">{campaign.audience_count}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Predicted Revenue</span>
                      <p className="text-sm font-semibold text-gray-700">₹{(campaign.predicted_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Actual Revenue</span>
                      <p className="text-sm font-semibold text-green-600">₹{(campaign.actual_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Created</span>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(campaign.id, e)}
                  className="text-gray-300 hover:text-red-400 ml-4 text-lg transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}