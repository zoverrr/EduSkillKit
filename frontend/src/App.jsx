import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SkillLibrary from './pages/SkillLibrary'
import SkillChat from './pages/SkillChat'
import CreateSkill from './pages/CreateSkill'
import Guide from './pages/Guide'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<SkillLibrary />} />
        <Route path="/chat" element={<SkillChat />} />
        <Route path="/chat/:skillName" element={<SkillChat />} />
        <Route path="/create" element={<CreateSkill />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
