import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Key, Cpu, Save,
  Loader2, CheckCircle2, AlertCircle, Circle
} from 'lucide-react'
import { fetchSettings, saveSettings, saveApiKeys } from '../services/api'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiKeys, setApiKeys] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveModel = async () => {
    setSaving(true)
    try {
      await saveSettings({
        provider: settings.provider,
        model: settings.model,
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
        top_p: settings.top_p,
        frequency_penalty: settings.frequency_penalty,
        presence_penalty: settings.presence_penalty,
      })
      showToast('success', '模型设置已保存')
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveKeys = async () => {
    setSaving(true)
    try {
      const filtered = Object.fromEntries(
        Object.entries(apiKeys).filter(([_, v]) => v.trim())
      )
      if (Object.keys(filtered).length === 0) {
        showToast('error', '请至少填写一个 API Key')
        return
      }
      await saveApiKeys(filtered)
      setApiKeys({})
      showToast('success', 'API Key 已保存')
      const updated = await fetchSettings()
      setSettings(updated)
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!settings) return null

  const currentProvider = settings.providers?.[settings.provider]
  const providerModels = currentProvider?.models || []

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
        <SettingsIcon className="w-6 h-6 inline mr-2 text-primary-600" />
        设置
      </h2>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Model Settings */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-5">
            <Cpu className="w-4 h-4 text-primary-600" />
            模型配置
          </h3>

          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">提供商</label>
              <select
                value={settings.provider}
                onChange={(e) => {
                  const p = e.target.value
                  const models = settings.providers?.[p]?.models || []
                  setSettings({ ...settings, provider: p, model: models[0] || '' })
                }}
                className="select"
              >
                {Object.entries(settings.providers || {}).map(([key, prov]) => (
                  <option key={key} value={key}>{prov.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">模型</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="select"
              >
                {providerModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Temperature */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              温度 <span className="text-slate-400 font-normal">({settings.temperature})</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>精确 (0)</span><span>创意 (2)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              最大输出 <span className="text-slate-400 font-normal">({settings.max_tokens} tokens)</span>
            </label>
            <input
              type="range"
              min="256"
              max="32768"
              step="256"
              value={settings.max_tokens}
              onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>简短 (256)</span><span>详尽 (32768)</span>
            </div>
          </div>

          {/* Top P */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Top P <span className="text-slate-400 font-normal">({settings.top_p})</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.top_p}
              onChange={(e) => setSettings({ ...settings, top_p: parseFloat(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>保守 (0)</span><span>开放 (1)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">控制采样的概率质量。较低的值使输出更集中和确定。</p>
          </div>

          {/* Frequency Penalty */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              频率惩罚 <span className="text-slate-400 font-normal">({settings.frequency_penalty})</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={settings.frequency_penalty}
              onChange={(e) => setSettings({ ...settings, frequency_penalty: parseFloat(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>不限 (-2)</span><span>严格 (2)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">降低重复使用已有词汇的概率，使文本更多样化。</p>
          </div>

          {/* Presence Penalty */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              话题惩罚 <span className="text-slate-400 font-normal">({settings.presence_penalty})</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={settings.presence_penalty}
              onChange={(e) => setSettings({ ...settings, presence_penalty: parseFloat(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>聚焦 (-2)</span><span>发散 (2)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">降低重复已提及话题的概率，鼓励引入新话题。</p>
          </div>

          <button onClick={handleSaveModel} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存模型设置
          </button>
        </div>

        {/* API Keys */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
            <Key className="w-4 h-4 text-primary-600" />
            API Key 管理
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            优先读取 <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">.env</code> 文件，
            也可在此直接输入。保存后写入本地配置文件。
          </p>

          <div className="space-y-3">
            {Object.entries(settings.providers || {}).map(([key, prov]) => {
              const status = prov.source
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 flex items-center gap-2">
                    {status === 'env' ? (
                      <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                    ) : status === 'manual' ? (
                      <Circle className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 fill-slate-300 text-slate-300" />
                    )}
                    <span className="text-sm font-medium text-slate-700">{prov.name}</span>
                  </div>
                  <input
                    type="password"
                    value={apiKeys[key] || ''}
                    onChange={(e) => setApiKeys({ ...apiKeys, [key]: e.target.value })}
                    placeholder={status !== 'none' ? '已配置（留空保持不变）' : '请输入 API Key'}
                    className="input flex-1"
                  />
                </div>
              )
            })}
          </div>

          <button onClick={handleSaveKeys} disabled={saving} className="btn-primary mt-5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存 API Key
          </button>
        </div>
      </div>
    </div>
  )
}
