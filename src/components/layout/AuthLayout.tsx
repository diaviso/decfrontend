import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        
        {/* Animated Shapes */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 w-24 h-24 rounded-2xl bg-white/5 backdrop-blur-sm rotate-45"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">DEC Learning</h1>
            <p className="text-xl text-white/80 max-w-md">
              Plateforme d'apprentissage moderne pour développer vos compétences
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 text-center"
          >
            <div className="glass-card p-4 bg-white/10">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-white/70">Quiz</div>
            </div>
            <div className="glass-card p-4 bg-white/10">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-white/70">Thèmes</div>
            </div>
            <div className="glass-card p-4 bg-white/10">
              <div className="text-3xl font-bold">1k+</div>
              <div className="text-sm text-white/70">Utilisateurs</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
