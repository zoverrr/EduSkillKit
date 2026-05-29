import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[260px] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-5xl mx-auto px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
