import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageSquare, Library, Wand2, ArrowRight,
  Sparkles, GraduationCap, Cpu, BookOpen,
  Lightbulb, Target, Zap, Shield, Users, BarChart3
} from 'lucide-react'
import { fetchSkills } from '../services/api'

const PROVIDER_COUNT = 9

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ skills: 0, categories: 0 })

  useEffect(() => {
    fetchSkills()
      .then((skills) => {
        const cats = new Set(skills.map((s) => s.category || '未分类'))
        setStats({ skills: skills.length, categories: cats.size })
      })
      .catch(() => {})
  }, [])

  const actions = [
    {
      icon: MessageSquare,
      title: '技能对话',
      desc: '选择技能，填写参数，获取 AI 辅助输出',
      color: 'from-primary-500 to-primary-700',
      shadow: 'shadow-primary-500/20',
      onClick: () => navigate('/chat'),
    },
    {
      icon: Library,
      title: '技能库',
      desc: '浏览全部内置教学技能，一键使用',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      onClick: () => navigate('/skills'),
    },
    {
      icon: Wand2,
      title: '创建技能',
      desc: '将你的教学经验封装为可复用的技能模板',
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      onClick: () => navigate('/create'),
    },
  ]

  const steps = [
    { icon: Target, title: '选择场景', desc: '从技能库中匹配你的教学需求' },
    { icon: Lightbulb, title: '填写参数', desc: '输入课程主题、学情、课时等关键信息' },
    { icon: Zap, title: 'AI 生成', desc: '系统自动组装指令链，调用大模型生成输出' },
    { icon: Shield, title: '审校使用', desc: '教师审核修改后直接用于教学实践' },
  ]

  const features = [
    { icon: BookOpen, title: '25 个内置技能', desc: '覆盖教学设计、课堂互动、学习评价、教研创新等场景，每个技能经过多轮测试优化' },
    { icon: Cpu, title: '9 家大模型', desc: 'DeepSeek、通义千问、MiMo 等国产大模型一键切换，统一 API 适配层' },
    { icon: Users, title: '教师共建', desc: '创建自定义技能并分享给同事，逐步形成校本 AI 资源库' },
    { icon: BarChart3, title: '结构化输出', desc: '输出包含教学目标、重难点、过程设计、评价方案等完整结构，可直接用于教案' },
    { icon: Shield, title: '数据安全', desc: '本地部署，API Key 自行管理，对话数据不上传第三方' },
    { icon: Sparkles, title: '持续进化', desc: '技能模板可迭代优化，越用越贴合你的教学习惯' },
  ]

  return (
    <div className="pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 pb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              EduSkillKit
            </h1>
            <p className="text-sm text-slate-500 font-medium">教育 AI 技能工作台</p>
          </div>
        </div>

        <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
          基于多层提示词架构与教学认知框架，将 25 个教学场景封装为可复用的「技能」引擎。
          教师填写参数，系统自动组装角色设定、认知模型、输出规范和质量约束——
          直接产出符合教学标准的结构化成果。
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4 mb-10"
      >
        {[
          { num: stats.skills, label: '内置技能', icon: BookOpen },
          { num: stats.categories, label: '教学场景', icon: Sparkles },
          { num: PROVIDER_COUNT, label: '大模型接入', icon: Cpu },
        ].map(({ num, label, icon: Icon }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="card px-6 py-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{num}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4 mb-16"
      >
        {actions.map(({ icon: Icon, title, desc, color, shadow, onClick }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            onClick={onClick}
            className="card p-6 cursor-pointer group"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow} mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 group-hover:gap-2.5 transition-all">
              开始使用 <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">使用流程</h2>
        <p className="text-sm text-slate-500 mb-8">四步完成，零提示词工程门槛</p>
        <div className="flex items-stretch gap-2">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex items-stretch flex-1">
              <div className="card p-5 text-center flex-1 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-xs font-bold text-primary-600 mb-1">步骤 {i + 1}</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-auto">{desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center px-1.5">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">核心优势</h2>
        <p className="text-sm text-slate-500 mb-8">底层技术壁垒 + 上层零门槛体验</p>
        <div className="grid grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Provider logos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-8 border-t border-slate-200"
      >
        <p className="text-xs text-slate-400 font-medium text-center mb-4">支持的国产大模型</p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {['DeepSeek', '通义千问', '智谱清言', '月之暗面', '腾讯混元', '零一万物', '百川智能', '讯飞星火', 'MiMo'].map(
            (name) => (
              <span key={name} className="text-sm text-slate-400 font-medium">
                {name}
              </span>
            )
          )}
        </div>
      </motion.div>
    </div>
  )
}
