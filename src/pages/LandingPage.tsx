import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  HelpCircle,
  Trophy,
  MessageSquare,
  FileText,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: BookOpen,
    title: 'Thèmes Structurés',
    description: 'Parcourez les différents thèmes du Diplôme d\'Expertise Comptable organisés de manière pédagogique.',
    color: 'bg-[#1B5E3D]',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Interactifs',
    description: 'Testez vos connaissances avec des quiz variés adaptés à chaque niveau de difficulté.',
    color: 'bg-[#2D7A50]',
  },
  {
    icon: Trophy,
    title: 'Système de Récompenses',
    description: 'Gagnez des étoiles, montez dans le classement et suivez votre progression.',
    color: 'bg-[#F5A623]',
  },
  {
    icon: FileText,
    title: 'Blog Éducatif',
    description: 'Accédez à des articles de qualité rédigés par des experts en comptabilité.',
    color: 'bg-[#1B5E3D]',
  },
  {
    icon: MessageSquare,
    title: 'Forum Communautaire',
    description: 'Échangez avec d\'autres candidats au DEC et partagez vos expériences.',
    color: 'bg-[#2D7A50]',
  },
  {
    icon: Bot,
    title: 'Assistant IA',
    description: 'Bénéficiez d\'un chatbot intelligent pour répondre à vos questions sur le DEC.',
    color: 'bg-[#F5A623]',
  },
];

const benefits = [
  'Préparation complète au DEC',
  'Suivi personnalisé de votre progression',
  'Contenu mis à jour régulièrement',
  'Accès illimité à tous les quiz',
  'Support de la communauté',
  'Statistiques détaillées',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0D1512]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0D1512]/90 backdrop-blur-md border-b border-[#D1DDD6] dark:border-[#2D3F35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="DEC Learning" className="h-10 w-10 rounded-xl shadow-lg" />
              <span className="text-xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">DEC Learning</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-[#1A2E23] dark:text-[#E8F0EC] hover:text-[#1B5E3D] dark:hover:text-[#3D9A6A]">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#1B5E3D] hover:bg-[#144832] dark:bg-[#2D7A50] dark:hover:bg-[#1B5E3D] text-white shadow-lg shadow-[#1B5E3D]/25">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Animated Background */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0EC] via-[#F8FAF9] to-[#D1DDD6] dark:from-[#0D1512] dark:via-[#141F1A] dark:to-[#1E2D26]" />
          
          {/* Animated floating shapes */}
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-[#1B5E3D]/20 to-[#3D9A6A]/10 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              rotate: [0, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-gradient-to-br from-[#F5A623]/15 to-[#FFBE4D]/10 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-[20%] w-80 h-80 rounded-full bg-gradient-to-br from-[#2D7A50]/15 to-[#1B5E3D]/10 blur-3xl"
          />
          
          {/* 3D Floating geometric shapes */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotateX: [0, 360],
              rotateY: [0, 180, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-32 right-[25%] w-16 h-16 border-2 border-[#1B5E3D]/30 dark:border-[#3D9A6A]/30 rounded-xl"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotateZ: [0, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-60 left-[12%] w-12 h-12 border-2 border-[#F5A623]/40 rounded-full"
          />
          <motion.div
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-40 right-[10%] w-20 h-20 border-2 border-[#2D7A50]/25 dark:border-[#3D9A6A]/25"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
          
          {/* Animated dots grid */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1B5E3D 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
          
          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg">
            <motion.line
              x1="0%" y1="30%" x2="100%" y2="70%"
              stroke="#1B5E3D"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.line
              x1="100%" y1="20%" x2="0%" y2="80%"
              stroke="#F5A623"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            />
          </svg>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="absolute w-2 h-2 rounded-full bg-[#F5A623]"
              style={{
                left: `${15 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/20 backdrop-blur-sm text-[#1B5E3D] dark:text-[#3D9A6A] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#1B5E3D]/20 dark:border-[#3D9A6A]/20">
                <Sparkles className="h-4 w-4" />
                Plateforme de préparation au DEC
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A2E23] dark:text-[#E8F0EC] mb-6">
                Préparez votre{' '}
                <span className="bg-gradient-to-r from-[#1B5E3D] via-[#2D7A50] to-[#F5A623] bg-clip-text text-transparent">
                  Diplôme d'Expertise Comptable
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[#5A7265] dark:text-[#8BA898] max-w-3xl mx-auto mb-8">
                Une plateforme complète pour réviser, s'exercer et réussir le DEC.
                Quiz interactifs, articles de qualité et communauté engagée.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-[#1B5E3D] hover:bg-[#144832] dark:bg-[#2D7A50] dark:hover:bg-[#1B5E3D] text-white shadow-lg shadow-[#1B5E3D]/25 gap-2">
                    Commencer gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="gap-2 border-2 border-[#D1DDD6] dark:border-[#2D3F35] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:border-[#1B5E3D] dark:hover:border-[#3D9A6A]">
                    J'ai déjà un compte
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '100+', label: 'Quiz disponibles', icon: BookOpen },
              { value: '500+', label: 'Questions', icon: HelpCircle },
              { value: '50+', label: 'Articles', icon: FileText },
              { value: '1000+', label: 'Utilisateurs', icon: Users },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white dark:bg-[#141F1A] border border-[#D1DDD6] dark:border-[#2D3F35] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-[#F5A623]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#5A7265] dark:text-[#8BA898] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E8F0EC]/50 dark:bg-[#1E2D26]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1A2E23] dark:text-[#E8F0EC]">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-[#5A7265] dark:text-[#8BA898] max-w-2xl mx-auto">
              Une plateforme complète avec tous les outils pour réussir votre préparation au DEC.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg h-full hover:shadow-xl transition-shadow bg-white dark:bg-[#141F1A]">
                    <CardContent className="p-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} shadow-lg mb-4`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-[#1A2E23] dark:text-[#E8F0EC]">{feature.title}</h3>
                      <p className="text-[#5A7265] dark:text-[#8BA898]">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1A2E23] dark:text-[#E8F0EC]">
                Pourquoi choisir{' '}
                <span className="bg-gradient-to-r from-[#1B5E3D] to-[#F5A623] bg-clip-text text-transparent">
                  DEC Learning
                </span>
                ?
              </h2>
              <p className="text-lg text-[#5A7265] dark:text-[#8BA898] mb-8">
                Notre plateforme a été conçue par et pour les candidats au DEC.
                Nous comprenons vos besoins et avons créé les outils adaptés à votre réussite.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/20">
                      <CheckCircle className="h-4 w-4 text-[#1B5E3D] dark:text-[#3D9A6A]" />
                    </div>
                    <span className="text-[#1A2E23] dark:text-[#E8F0EC]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B5E3D]/20 to-[#F5A623]/20 rounded-3xl blur-3xl" />
              <Card className="relative border border-[#D1DDD6] dark:border-[#2D3F35] shadow-2xl bg-white dark:bg-[#141F1A]">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-[#F5A623] flex items-center justify-center shadow-lg shadow-[#F5A623]/30">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">Système de récompenses</div>
                      <div className="text-[#5A7265] dark:text-[#8BA898]">Motivez-vous avec les étoiles</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5A623]/10 dark:bg-[#F5A623]/20">
                      <span className="font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Quiz réussi</span>
                      <span className="font-bold text-[#F5A623]">+5 à +15 ⭐</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#E8F0EC] dark:bg-[#1E2D26]">
                      <span className="font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Bonus difficulté</span>
                      <span className="font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">x1.5 à x2</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#E8F0EC] dark:bg-[#1E2D26]">
                      <span className="font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Classement</span>
                      <span className="font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">Top 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B5E3D] via-[#144832] to-[#0D3321] p-12 text-center text-white"
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.15)'%3E%3C/path%3E%3C/svg%3E\")" }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F5A623]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Prêt à commencer votre préparation ?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Rejoignez des centaines de candidats qui préparent leur DEC avec nous.
                Inscription gratuite et accès immédiat.
              </p>
              <Link to="/register">
                <Button size="lg" className="gap-2 bg-[#F5A623] hover:bg-[#D4890A] text-[#1A2E23] font-semibold shadow-lg shadow-[#F5A623]/30">
                  Créer mon compte gratuit
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D1DDD6] dark:border-[#2D3F35] py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0D1512]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="DEC Learning" className="h-10 w-10 rounded-xl shadow-lg" />
              <span className="text-xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">DEC Learning</span>
            </div>
            <p className="text-[#5A7265] dark:text-[#8BA898] text-center">
              © {new Date().getFullYear()} DEC Learning. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
