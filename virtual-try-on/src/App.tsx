import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/layout/Navbar'
import { useLangStore } from './i18n/store'
import './App.css'
import './mobile.css'

// Lazy load pages for optimization
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })))
const Verify = lazy(() => import('./pages/Verify').then(module => ({ default: module.Verify })))
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })))
const Studio3D = lazy(() => import('./pages/Studio3D').then(module => ({ default: module.Studio3D })))
const AdminMaleScene = lazy(() => import('./pages/AdminMaleScene').then(module => ({ default: module.AdminMaleScene })))
const MenShowroom = lazy(() => import('./pages/MenShowroom').then(module => ({ default: module.MenShowroom })))

// ── Премиальный, но оптимизированный переход (Scale + Slide + Fade без filter) ──
const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 15 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] // Apple-style smooth ease
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: -10,
    transition: { 
      duration: 0.3, 
      ease: [0.32, 0, 0.67, 0] as [number, number, number, number] 
    },
  },
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
)

const LoadingFallback = () => (
  <div style={{
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dark)',
    color: 'var(--text-main)',
    flexDirection: 'column',
    gap: '16px',
  }}>
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--primary)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
    <span
      style={{
        fontFamily: 'var(--font-punk)',
        fontSize: '13px',
        letterSpacing: '0.3em',
        color: 'var(--primary)',
        opacity: 0.7,
      }}
    >
      LOADING
    </span>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageWrapper>
            <Navbar />
            <Home />
          </PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper>
            <Navbar />
            <Login />
          </PageWrapper>
        } />
        <Route path="/register" element={
          <PageWrapper>
            <Navbar />
            <Register />
          </PageWrapper>
        } />
        <Route path="/verify" element={
          <PageWrapper>
            <Navbar />
            <Verify />
          </PageWrapper>
        } />
        <Route path="/profile" element={
          <PageWrapper>
            <Navbar />
            <Profile />
          </PageWrapper>
        } />
        <Route path="/studio" element={
          <Studio3D />
        } />
        <Route path="/admin/men-scene" element={
          <AdminMaleScene />
        } />
        <Route path="/showroom/men" element={
          <MenShowroom />
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const lang = useLangStore(s => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  )
}

export default App
