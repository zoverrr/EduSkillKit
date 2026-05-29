import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, X, FileText, Loader2, Sparkles,
  BookOpen, Users, BarChart3, Search, Lightbulb, Wrench,
  ArrowLeft, Tag, ChevronRight
} from 'lucide-react'
import { useStore } from '../store'
import {
  fetchSkills, streamChat, fetchConversation,
  saveConversation, updateConversation, fetchSettings,
} from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

const CATEGORY_ICONS = {
  '学习设计': BookOpen,
  '教学实施': Users,
  '学习评价': BarChart3,
  '学情分析': Search,
  '课程育人': Lightbulb,
  '教研创新': Sparkles,
  '班级管理': Users,
  '工具箱': Wrench,
}

const CATEGORY_COLORS = {
  '学习设计': 'from-blue-500 to-indigo-600',
  '教学实施': 'from-emerald-500 to-teal-600',
  '学习评价': 'from-amber-500 to-orange-600',
  '学情分析': 'from-violet-500 to-purple-600',
  '课程育人': 'from-rose-500 to-pink-600',
  '教研创新': 'from-cyan-500 to-blue-600',
  '班级管理': 'from-slate-500 to-slate-700',
  '工具箱': 'from-gray-500 to-gray-700',
}

export default function SkillChat() {
  const [searchParams] = useSearchParams()
  const { skillName: urlSkillName } = useParams()
  const navigate = useNavigate()
  const convIdParam = searchParams.get('conv')

  const {
    skills, setSkills,
    currentSkill, setCurrentSkill,
    messages, addMessage, setMessages,
    currentConvId, setCurrentConvId,
    uploadedFileText, setUploadedFileText,
    skillParams, setSkillParams,
    isStreaming, setIsStreaming,
    resetChat,
  } = useStore()

  const [inputText, setInputText] = useState('')
  const [uploadFileName, setUploadFileName] = useState('')
  const [providerName, setProviderName] = useState('')
  const [modelName, setModelName] = useState('')
  const [browseSearch, setBrowseSearch] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchSkills().then(setSkills).catch(() => {})
    fetchSettings().then((s) => {
      setProviderName(s.providers?.[s.provider]?.name || s.provider)
      setModelName(s.model)
    }).catch(() => {})
  }, [setSkills])

  // Auto-select skill from URL param
  useEffect(() => {
    if (urlSkillName && skills.length && !currentSkill) {
      const found = skills.find((s) => s.name === urlSkillName)
      if (found) {
        setCurrentSkill(found)
        const defaults = {}
        found.parameters.forEach((p) => { defaults[p.name] = p.default || '' })
        setSkillParams(defaults)
      }
    }
  }, [urlSkillName, skills, currentSkill, setCurrentSkill, setSkillParams])

  useEffect(() => {
    if (convIdParam) {
      fetchConversation(convIdParam).then((conv) => {
        setMessages(conv.messages || [])
        setCurrentConvId(conv.id)
        if (conv.skill_name && skills.length) {
          const found = skills.find((s) => s.name === conv.skill_name)
          if (found) setCurrentSkill(found)
        }
      }).catch(() => {})
    }
  }, [convIdParam, skills, setMessages, setCurrentConvId, setCurrentSkill])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group skills by category
  const grouped = {}
  skills.forEach((s) => {
    const cat = s.category || '未分类'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(s)
  })

  // Filter for browse
  const filteredGroups = {}
  Object.entries(grouped).forEach(([cat, catSkills]) => {
    if (!browseSearch) {
      filteredGroups[cat] = catSkills
      return
    }
    const q = browseSearch.toLowerCase()
    const filtered = catSkills.filter(
      (s) =>
        s.display_name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    )
    if (filtered.length) filteredGroups[cat] = filtered
  })

  const handleSkillChange = (skill) => {
    setCurrentSkill(skill)
    const defaults = {}
    skill.parameters.forEach((p) => {
      defaults[p.name] = p.default || ''
    })
    setSkillParams(defaults)
    resetChat()
  }

  const handleBack = () => {
    setCurrentSkill(null)
    resetChat()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setUploadedFileText(data.text)
      setUploadFileName(file.name)
    } catch {
      alert('文件上传失败')
    }
  }

  const removeFile = () => {
    setUploadedFileText('')
    setUploadFileName('')
  }

  const handleSend = useCallback(async () => {
    if (!currentSkill) return
    if (isStreaming) return

    const userMsg = inputText.trim()
    setInputText('')

    let displayText = userMsg || '📎 已上传文件'
    addMessage({ role: 'user', content: displayText })

    let fullMsg = userMsg
    if (uploadedFileText) {
      fullMsg = fullMsg
        ? `${fullMsg}\n\n---\n文件内容：\n${uploadedFileText}`
        : uploadedFileText
    }

    setIsStreaming(true)
    let fullResponse = ''

    try {
      addMessage({ role: 'assistant', content: '' })
      const gen = streamChat(currentSkill.name, skillParams, fullMsg)
      for await (const chunk of gen) {
        fullResponse += chunk
        setMessages([
          ...messages,
          { role: 'user', content: displayText },
          { role: 'assistant', content: fullResponse },
        ])
      }
    } catch (err) {
      fullResponse = `错误：${err.message}`
      setMessages([
        ...messages,
        { role: 'user', content: displayText },
        { role: 'assistant', content: fullResponse },
      ])
    } finally {
      setIsStreaming(false)
      const finalMessages = [
        ...messages,
        { role: 'user', content: displayText },
        { role: 'assistant', content: fullResponse },
      ]
      const title = `${currentSkill.display_name} - ${(userMsg || '执行').slice(0, 15)}`
      try {
        if (currentConvId) {
          await updateConversation(currentConvId, { messages: finalMessages })
        } else {
          const res = await saveConversation({
            title,
            skill_name: currentSkill.name,
            model: modelName,
            provider: providerName,
            messages: finalMessages,
          })
          setCurrentConvId(res.id)
        }
      } catch {}
    }
  }, [
    currentSkill, isStreaming, inputText, uploadedFileText, skillParams,
    messages, currentConvId, modelName, providerName,
    addMessage, setMessages, setIsStreaming, setCurrentConvId,
  ])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const missingRequired = currentSkill?.parameters
    ?.filter((p) => p.required && !skillParams[p.name])
    .map((p) => p.display_name) || []

  // ── Skill Browser (no skill selected) ──
  if (!currentSkill) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">选择技能</h2>
          <p className="text-sm text-slate-500">
            每个技能内置角色设定、认知框架、输出规范和质量约束四层指令架构，针对特定教学场景深度优化
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索技能名称或关键词..."
            value={browseSearch}
            onChange={(e) => setBrowseSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Quick start examples */}
        {!browseSearch && (
          <div className="mb-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">快速开始 — 点击试试</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  skill: 'lesson_plan',
                  title: '帮我设计一节教案',
                  desc: '高职 · 水利工程测量 · 2课时',
                  params: { topic: '水利工程测量', subject: '水利工程', grade: '高职', hours: '2', context: '学生为大二，已学过基础测量理论' },
                },
                {
                  skill: 'bloom_classifier',
                  title: '分析教学目标的认知层次',
                  desc: '输入目标列表，自动归类到布鲁姆六个层次',
                  params: { objectives_list: '1. 能够说出水准仪的基本构造\n2. 能够解释高程测量的原理\n3. 能够独立完成四等水准测量\n4. 能够分析测量误差的来源' },
                },
                {
                  skill: 'classroom_interaction',
                  title: '设计课堂互动方案',
                  desc: '根据主题生成提问、讨论、活动设计',
                  params: { topic: '钢筋混凝土结构基本原理', grade: '高职', duration: '45', interaction_type: '混合式' },
                },
                {
                  skill: 'student_comment',
                  title: '生成学生评语',
                  desc: '批量生成个性化期末评语',
                  params: { student_info: '张三，学习认真，动手能力强，但理论基础较弱，性格内向', comment_style: '鼓励为主', term: '2025-2026学年第一学期' },
                },
              ].map((ex) => (
                <button
                  key={ex.skill}
                  onClick={() => {
                    const skill = skills.find((s) => s.name === ex.skill)
                    if (skill) {
                      handleSkillChange(skill)
                      setSkillParams(ex.params)
                    }
                  }}
                  className="card p-4 text-left group hover:border-primary-300 transition-all"
                >
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 mb-1">{ex.title}</h4>
                  <p className="text-xs text-slate-500">{ex.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category groups */}
        <div className="space-y-10">
          {Object.entries(filteredGroups).map(([cat, catSkills]) => {
            const Icon = CATEGORY_ICONS[cat] || Sparkles
            const gradient = CATEGORY_COLORS[cat] || 'from-slate-500 to-slate-700'
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{cat}</h3>
                  <span className="text-xs text-slate-400 font-medium">{catSkills.length} 个技能</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {catSkills.map((skill, i) => (
                    <motion.button
                      key={skill.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSkillChange(skill)}
                      className="card p-4 text-left group hover:border-primary-300 hover:shadow-card-hover transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                          {skill.display_name}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                        {skill.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {skill.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-medium"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {Object.keys(filteredGroups).length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">没有找到匹配的技能</p>
          </div>
        )}
      </div>
    )
  }

  // ── Chat UI (skill selected) ──
  const CatIcon = CATEGORY_ICONS[currentSkill.category] || Sparkles

  return (
    <div>
      {/* Skill Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回技能列表
        </button>

        <div className="card p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[currentSkill.category] || 'from-slate-500 to-slate-700'} flex items-center justify-center flex-shrink-0`}>
              <CatIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-900">{currentSkill.display_name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[11px] font-semibold">
                  {currentSkill.category}
                </span>
                <div className="flex items-center gap-2 ml-auto text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium">{providerName}</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium">{modelName}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{currentSkill.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {currentSkill.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-500 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-5">
        {/* Left: Chat Area */}
        <div className="flex-1 min-w-0">
          {/* Messages */}
          <div className="card min-h-[350px] max-h-[520px] overflow-y-auto p-5 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary-400" />
                </div>
                <p className="text-sm font-medium mb-1">填写参数，开始对话</p>
                <p className="text-xs text-slate-400">在右侧填写必要参数后，点击「执行」或直接输入补充说明</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="card p-3">
            {uploadFileName && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-primary-50 rounded-lg">
                <FileText className="w-4 h-4 text-primary-600" />
                <span className="text-xs text-primary-700 font-medium flex-1 truncate">{uploadFileName}</span>
                <button onClick={removeFile} className="text-primary-400 hover:text-primary-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <input type="file" className="hidden" accept=".docx,.pdf,.xlsx,.xls,.txt" onChange={handleFileUpload} />
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="补充说明（可选）..."
                rows={1}
                className="textarea flex-1 min-h-[40px] max-h-[120px] py-2.5 border-0 focus:ring-0 bg-transparent"
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || (!inputText.trim() && !uploadedFileText)}
                className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center
                           hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Parameters */}
        <div className="w-72 flex-shrink-0">
          <div className="card p-5 sticky top-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4">参数设置</h3>
            <div className="space-y-4">
              {currentSkill.parameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {param.display_name}
                    {param.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {param.type === 'textarea' ? (
                    <textarea
                      value={skillParams[param.name] || ''}
                      onChange={(e) => setSkillParams({ ...skillParams, [param.name]: e.target.value })}
                      placeholder={param.description}
                      rows={3}
                      className="textarea text-xs"
                    />
                  ) : param.type === 'select' ? (
                    <select
                      value={skillParams[param.name] || ''}
                      onChange={(e) => setSkillParams({ ...skillParams, [param.name]: e.target.value })}
                      className="select text-xs"
                    >
                      <option value="">请选择...</option>
                      {(param.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : param.type === 'number' ? (
                    <input
                      type="number"
                      value={skillParams[param.name] || ''}
                      onChange={(e) => setSkillParams({ ...skillParams, [param.name]: e.target.value })}
                      placeholder={param.description}
                      className="input text-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      value={skillParams[param.name] || ''}
                      onChange={(e) => setSkillParams({ ...skillParams, [param.name]: e.target.value })}
                      placeholder={param.description}
                      className="input text-xs"
                    />
                  )}
                  {param.description && (
                    <p className="text-[11px] text-slate-400 mt-1">{param.description}</p>
                  )}
                </div>
              ))}
            </div>

            {missingRequired.length > 0 && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[11px] text-amber-700 font-medium">
                  请填写：{missingRequired.join('、')}
                </p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={isStreaming || missingRequired.length > 0 || (!inputText.trim() && !uploadedFileText)}
              className="btn-primary w-full mt-5"
            >
              {isStreaming ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> 执行</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
