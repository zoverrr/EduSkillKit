import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Trash2, ArrowRight, Tag } from 'lucide-react'
import { fetchSkills, deleteSkill } from '../services/api'

export default function SkillLibrary() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('全部')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || '未分类'))
    return ['全部', ...Array.from(cats).sort()]
  }, [skills])

  const filtered = useMemo(() => {
    let result = skills
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.display_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (selectedCat !== '全部') {
      result = result.filter((s) => (s.category || '未分类') === selectedCat)
    }
    return result
  }, [skills, search, selectedCat])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((s) => {
      const cat = s.category || '未分类'
      if (!map[cat]) map[cat] = []
      map[cat].push(s)
    })
    return map
  }, [filtered])

  const handleDelete = async (e, name) => {
    e.stopPropagation()
    if (!confirm('确定删除此技能？')) return
    await deleteSkill(name)
    setSkills(skills.filter((s) => s.name !== name))
  }

  const handleUse = (name) => {
    navigate(`/chat/${name}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">技能库</h2>
        <button onClick={() => navigate('/create')} className="btn-primary">
          <Plus className="w-4 h-4" /> 创建新技能
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索技能名称、描述或标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="select w-48"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Skill groups */}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
            {cat}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {catSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-5 flex flex-col"
              >
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                  {skill.display_name}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-3">
                  {skill.description.length > 80
                    ? skill.description.slice(0, 80) + '...'
                    : skill.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {skill.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-500 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUse(skill.name)}
                    className="btn-primary flex-1 text-xs py-2"
                  >
                    使用 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, skill.name)}
                    className="btn-secondary text-xs py-2 px-3 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                    title="删除此技能"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">没有找到匹配的技能</p>
        </div>
      )}
    </div>
  )
}
