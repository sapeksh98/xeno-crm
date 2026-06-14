import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAICampaign, launchCampaign, sendCampaign } from '../lib/api'

export default function Home() {
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [launching, setLaunching] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!goal.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await createAICampaign(goal)
      console.log('AI Response:', res.data) // debug
      setResult(res.data)
      console.log('Full response:', JSON.stringify(res.data, null, 2))
    } catch (err) {
      console.error('Error:', err.response?.data || err.message)
      setError('AI agent failed. Check your API key and backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleLaunch = async () => {
    setLaunching(true)
    setError('')
    try {
      const campaignId = result.campaign.id

      await launchCampaign(campaignId)
      await sendCampaign(campaignId)

      setSuccess('✅ Campaign launched! Redirecting to analytics...')
      setTimeout(() => {
        navigate(`/campaigns/${campaignId}`)
      }, 1500)

    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message
      setError(`Failed: ${errorDetail}`)
    } finally {
      setLaunching(false)
    }
  }

  const campaign = result?.campaign
  const metrics = result?.predicted_metrics

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          What do you want to achieve today?
        </h1>
        <p className="text-gray-500 text-lg">
          Describe your marketing goal and AI will build the campaign for you.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <textarea
          className="w-full border border-gray-200 rounded-xl p-4 text-gray-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="e.g. Increase weekend sales from inactive premium customers in Mumbai..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !goal.trim()}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? '🤖 AI is building your campaign...' : '✨ Generate Campaign'}
        </button>
        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        {success && <p className="text-green-500 mt-3 text-sm">{success}</p>} 
      </div>

      {/* Result */}
      {result && campaign && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{campaign.name || 'AI Campaign'}</h2>
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              AI Generated
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.audience_count || campaign.audience_count || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Audience</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700 capitalize">{campaign.channel || 'whatsapp'}</p>
              <p className="text-sm text-gray-500 mt-1">Channel</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                ₹{(campaign.predicted_revenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Est. Revenue</p>
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">AI Generated Filters</p>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-sm overflow-x-auto">
              {campaign.filters ? JSON.stringify(JSON.parse(campaign.filters), null, 2) : '{}'}
            </pre>
          </div>

          {/* Message Preview */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Message Preview</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-gray-800 text-sm">
              {campaign.message_template || 'Message will be personalized for each customer'}
            </div>
          </div>

          {/* Predicted Metrics */}
          {metrics && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3">Predicted Performance</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {launching ? '⏳ Launching Campaign...' : '🚀 Launch Campaign'}
            </button>
            <button
              onClick={() => { setResult(null); setGoal('') }}
              className="px-6 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}