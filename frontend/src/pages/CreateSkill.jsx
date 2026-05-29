import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Sparkles, Save, Check,
  Loader2, Wand2
} from 'lucide-react'
import { createSkill } from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

const CATEGORIES = [
  '学习设计', '教学实施', '学习评价', '学情分析',
  '课程育人', '班级管理', '教研创新', '工具箱',
]

const STEPS = [
  { num: 1, label: '描述问题' },
  { num: 2, label: '定义参数' },
  { num: 3, label: '生成模板' },
  { num: 4, label: '预览发布' },
]

export default function CreateSkill() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    name: '', display_name: '', description: '',
    category: CATEGORIES[0], tags: '', problem: '',
    parameters: [
      { name: '', display_name: '', type: 'text', description: '', required: true, default: '', options: [] },
    ],
  })
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateData = (key, value) => setData((d) => ({ ...d, [key]: value }))

  const updateParam = (index, key, value) => {
    const params = [...data.parameters]
    params[index] = { ...params[index], [key]: value }
    setData((d) => ({ ...d, parameters: params }))
  }

  const addParam = () => {
    setData((d) => ({
      ...d,
      parameters: [...d.parameters, { name: '', display_name: '', type: 'text', description: '', required: true, default: '', options: [] }],
    }))
  }

  const removeParam = (index) => {
    setData((d) => ({
      ...d,
      parameters: d.parameters.filter((_, i) => i !== index),
    }))
  }

  const generateTemplate = async () => {
    setGenerating(true)
    const paramDesc = data.parameters
      .filter((p) => p.name)
      .map((p) => `- ${p.display_name}(${p.name}): ${p.description}`)
      .join('\n')

    const prompt = `你是提示词工程专家。为以下教学技能生成 Jinja2 提示词模板。

名称：${data.display_name}  描述：${data.description}
场景：${data.category}  问题：${data.problem}
参数：
${paramDesc}

要求：以"你是一位..."开头，用 {{ 变量名 }} 引用参数，列出输出格式要求。直接输出模板。`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_name: 'lesson_plan',
          params: {},
          message: prompt,
        }),
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.done) break
            if (d.content) {
              full += d.content
              setGeneratedPrompt(full)
            }
          } catch {}
        }
      }
    } catch (err) {
      alert(`生成失败：${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await createSkill({
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        category: data.category,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        parameters: data.parameters.filter((p) => p.name),
        prompt_template: generatedPrompt,
      })
      navigate('/skills')
    } catch (err) {
      alert(`保存失败：${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
        <Wand2 className="w-6 h-6 inline mr-2 text-primary-600" />
        创建新技能
      </h2>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                step === s.num
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${step > s.num ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Describe problem */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">英文标识 *</label>
                  <input
                    value={data.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    placeholder="quiz_generator"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">显示名称 *</label>
                  <input
                    value={data.display_name}
                    onChange={(e) => updateData('display_name', e.target.value)}
                    placeholder="课堂小测生成器"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">技能描述</label>
                <textarea
                  value={data.description}
                  onChange={(e) => updateData('description', e.target.value)}
                  placeholder="简要描述这个技能的功能..."
                  rows={2}
                  className="textarea"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">应用场景</label>
                  <select
                    value={data.category}
                    onChange={(e) => updateData('category', e.target.value)}
                    className="select"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">标签（逗号分隔）</label>
                  <input
                    value={data.tags}
                    onChange={(e) => updateData('tags', e.target.value)}
                    placeholder="教案, 教学设计, 备课"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">解决的教学问题</label>
                <textarea
                  value={data.problem}
                  onChange={(e) => updateData('problem', e.target.value)}
                  placeholder="描述这个技能要解决什么教学问题..."
                  rows={3}
                  className="textarea"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!data.name || !data.display_name) { alert('请填写名称'); return }
                    setStep(2)
                  }}
                  className="btn-primary"
                >
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Examples for step 1 */}
          {step === 1 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">已有技能示例 — 可参考填写</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: '课堂小测生成器', cat: '学习评价', desc: '根据教学主题和知识点，自动生成包含选择题、判断题、简答题的课堂小测验', tags: '小测, 命题, 课堂评价' },
                  { name: '课程思政融入设计', cat: '课程育人', desc: '将思政元素自然融入专业课教学，避免生硬说教', tags: '课程思政, 育人, 教学设计' },
                  { name: '学情分析报告', cat: '学情分析', desc: '根据成绩数据和课堂表现，生成学情分析报告', tags: '学情分析, 数据分析, 报告' },
                ].map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => {
                      updateData('display_name', ex.name)
                      updateData('description', ex.desc)
                      updateData('tags', ex.tags)
                      updateData('category', ex.cat)
                    }}
                    className="card p-3 text-left hover:border-primary-300 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-900 mb-0.5">{ex.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{ex.desc}</div>
                    <div className="text-[10px] text-primary-600 mt-1">点击填入</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Define parameters */}
          {step === 2 && (
            <div className="card p-6">
              <p className="text-sm text-slate-500 mb-5">定义用户需要填写的参数</p>
              <div className="space-y-4">
                {data.parameters.map((param, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <input
                        value={param.name}
                        onChange={(e) => updateParam(i, 'name', e.target.value)}
                        placeholder="英文名 (topic)"
                        className="input text-xs"
                      />
                      <input
                        value={param.display_name}
                        onChange={(e) => updateParam(i, 'display_name', e.target.value)}
                        placeholder="显示名 (教学主题)"
                        className="input text-xs"
                      />
                      <select
                        value={param.type}
                        onChange={(e) => updateParam(i, 'type', e.target.value)}
                        className="select text-xs"
                      >
                        <option value="text">文本</option>
                        <option value="textarea">多行文本</option>
                        <option value="select">下拉选择</option>
                        <option value="number">数字</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={param.description}
                        onChange={(e) => updateParam(i, 'description', e.target.value)}
                        placeholder="参数说明"
                        className="input text-xs"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          value={param.default}
                          onChange={(e) => updateParam(i, 'default', e.target.value)}
                          placeholder="默认值"
                          className="input text-xs flex-1"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParam(i, 'required', e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          必填
                        </label>
                        {data.parameters.length > 1 && (
                          <button
                            onClick={() => removeParam(i)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addParam} className="btn-secondary mt-4 text-xs">
                + 添加参数
              </button>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> 上一步
                </button>
                <button onClick={() => setStep(3)} className="btn-primary">
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generate template */}
          {step === 3 && (
            <div className="card p-6">
              <button
                onClick={generateTemplate}
                disabled={generating}
                className="btn-primary mb-5"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> 用 AI 生成模板</>
                )}
              </button>
              {generatedPrompt && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    模板（可编辑）
                  </label>
                  <textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    rows={16}
                    className="textarea font-mono text-xs"
                  />
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> 上一步
                </button>
                {generatedPrompt && (
                  <button onClick={() => setStep(4)} className="btn-primary">
                    下一步 <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Preview and publish */}
          {step === 4 && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">SKILL.md 预览</h3>
              <div className="bg-slate-900 rounded-xl p-5 overflow-auto max-h-[500px]">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`---
name: ${data.name}
display_name: ${data.display_name}
version: 1.0.0
description: ${data.description}
category: ${data.category}
tags: [${data.tags}]
author: 教师自建
parameters:
${data.parameters.filter(p => p.name).map(p => `  - name: ${p.name}
    display_name: ${p.display_name}
    type: ${p.type}
    description: ${p.description}
    required: ${p.required}
    default: "${p.default}"`).join('\n')}
---

${generatedPrompt}`}
                </pre>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(3)} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> 上一步
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 保存中...</>
                  ) : (
                    <><Save className="w-4 h-4" /> 保存发布</>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
