import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Trophy,
  MessageSquare,
  FileText,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: BookOpen,
    title: 'Thèmes Structurés',
    description: 'Parcourez les différents thèmes du Diplôme d\'Expertise Comptable organisés de manière pédagogique.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Interactifs',
    description: 'Testez vos connaissances avec des quiz variés adaptés à chaque niveau de difficulté.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Trophy,
    title: 'Système de Récompenses',
    description: 'Gagnez des étoiles, montez dans le classement et suivez votre progression.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: FileText,
    title: 'Blog Éducatif',
    description: 'Accédez à des articles de qualité rédigés par des experts en comptabilité.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: MessageSquare,
    title: 'Forum Communautaire',
    description: 'Échangez avec d\'autres candidats au DEC et partagez vos expériences.',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Users,
    title: 'Communauté Active',
    description: 'Rejoignez une communauté de futurs experts-comptables motivés.',
    color: 'from-indigo-500 to-violet-500',
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">DEC Learning</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Plateforme de préparation au DEC
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Préparez votre{' '}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Diplôme d'Expertise Comptable
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Une plateforme complète pour réviser, s'exercer et réussir le DEC.
                Quiz interactifs, articles de qualité et communauté engagée.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 gap-2">
                    Commencer gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="gap-2">
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
              { value: '100+', label: 'Quiz disponibles' },
              { value: '500+', label: 'Questions' },
              { value: '50+', label: 'Articles' },
              { value: '1000+', label: 'Utilisateurs' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                  <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Pourquoi choisir{' '}
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  DEC Learning
                </span>
                ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{benefit}</span>
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Système de récompenses</div>
                      <div className="text-muted-foreground">Motivez-vous avec les étoiles</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                      <span className="font-medium">Quiz réussi</span>
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">+5 à +15 ⭐</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                      <span className="font-medium">Bonus difficulté</span>
                      <span className="font-bold text-primary">x1.5 à x2</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                      <span className="font-medium">Classement</span>
                      <span className="font-bold text-primary">Top 100</span>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-12 text-center text-white"
          >
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")" }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Prêt à commencer votre préparation ?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Rejoignez des centaines de candidats qui préparent leur DEC avec nous.
                Inscription gratuite et accès immédiat.
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Créer mon compte gratuit
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">DEC Learning</span>
            </div>
            <p className="text-muted-foreground text-center">
              © {new Date().getFullYear()} DEC Learning. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
