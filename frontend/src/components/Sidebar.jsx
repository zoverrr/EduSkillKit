import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Home, MessageSquare, Library, Wand2, Settings,
  Plus, Trash2, GraduationCap, BookOpen
} from 'lucide-react'
import { useStore } from '../store'
import { fetchConversations, deleteConversation } from '../services/api'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/chat', label: '技能对话', icon: MessageSquare },
  { path: '/skills', label: '技能库', icon: Library },
  { path: '/create', label: '创建技能', icon: Wand2 },
  { path: '/guide', label: '使用指南', icon: BookOpen },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { conversations, setConversations, setCurrentSkill, resetChat } = useStore()

  const isChatPage = location.pathname.startsWith('/chat')

  useEffect(() => {
    if (isChatPage) {
      fetchConversations(20).then(setConversations).catch(() => {})
    }
  }, [isChatPage, setConversations])

  const handleDeleteConv = async (e, id) => {
    e.stopPropagation()
    await deleteConversation(id)
    setConversations(conversations.filter((c) => c.id !== id))
  }

  const handleNewChat = () => {
    resetChat()
    setCurrentSkill(null)
    navigate('/chat')
  }

  return (
    <aside className="w-[260px] h-screen bg-slate-900 flex flex-col shadow-sidebar fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">EduSkillKit</h1>
            <p className="text-[10px] text-slate-500 font-medium">教育 AI 技能工作台</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Conversations (only on chat page) */}
      {isChatPage && (
        <div className="mt-4 flex-1 flex flex-col min-h-0 px-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              历史对话
            </span>
            <button
              onClick={handleNewChat}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5 pb-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat?conv=${conv.id}`)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConv(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-slate-600 px-3 py-4 text-center">暂无对话</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/6 mt-auto">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          EduSkillKit v0.1.0
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          &copy; 2024-2026 EduSkillKit
        </p>
        <p className="text-[9px] text-slate-700 mt-0.5">
          Released under the MIT License
        </p>
      </div>
    </aside>
  )
}
