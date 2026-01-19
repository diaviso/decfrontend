import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  Trophy,
  Star,
  Target,
  Clock,
  TrendingUp,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface UserStats {
  totalStars: number;
  rank: number;
  totalUsers: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
  totalAttempts: number;
}

interface RecentAttempt {
  id: string;
  quizTitle: string;
  score: number;
  passed: boolean;
  starsEarned: number;
  completedAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function UserDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, attemptsRes, positionRes] = await Promise.all([
          api.get('/dashboard/user-stats'),
          api.get('/quizzes/attempts'),
          api.get('/leaderboard/me'),
        ]);

        const attemptsData = attemptsRes.data.slice(0, 5).map((a: any) => ({
          id: a.id,
          quizTitle: a.quiz?.title || 'Quiz',
          score: a.score,
          passed: a.score >= (a.quiz?.passingScore || 70),
          starsEarned: a.starsEarned || 0,
          completedAt: a.completedAt,
        }));

        setStats({
          totalStars: user?.stars || 0,
          rank: positionRes.data.rank,
          totalUsers: positionRes.data.totalUsers,
          quizzesCompleted: statsRes.data.uniqueQuizzesCompleted || 0,
          quizzesPassed: statsRes.data.quizzesPassed || 0,
          totalQuizzes: statsRes.data.totalQuizzes || 0,
          averageScore: statsRes.data.averageScore || 0,
          totalAttempts: statsRes.data.totalAttempts || 0,
        });
        setRecentAttempts(attemptsData);
      } catch (error) {
        console.error('Failed to fetch user dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.stars]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const successRate = stats && stats.totalAttempts > 0
    ? Math.round((stats.quizzesPassed / stats.totalAttempts) * 100)
    : 0;

  const completionRate = stats && stats.totalQuizzes > 0
    ? Math.round((stats.quizzesCompleted / stats.totalQuizzes) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Continuez votre préparation au DEC et améliorez vos compétences.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold">{stats?.totalStars || 0} étoiles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Trophy className="h-5 w-5 text-yellow-300" />
              <span>Rang #{stats?.rank || '-'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Target className="h-5 w-5" />
              <span>{successRate}% de réussite</span>
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Étoiles totales</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalStars || 0}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Rang #{stats?.rank || '-'} / {stats?.totalUsers || '-'}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                  <Star className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quiz complétés</p>
                  <p className="text-3xl font-bold mt-1">{stats?.quizzesCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    sur {stats?.totalQuizzes || 0} disponibles
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <HelpCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                  <p className="text-3xl font-bold mt-1">{successRate}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stats?.quizzesPassed || 0} quiz réussis
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score moyen</p>
                  <p className="text-3xl font-bold mt-1">{stats?.averageScore || 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    sur {stats?.totalAttempts || 0} tentatives
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          </Card>
        </motion.div>
      </motion.div>

      {/* Progress & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Ma progression
              </CardTitle>
              <CardDescription>Suivez votre avancement dans les quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Quiz complétés</span>
                  <span className="text-sm text-muted-foreground">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.quizzesCompleted || 0} / {stats?.totalQuizzes || 0} quiz
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taux de réussite</span>
                  <span className="text-sm text-muted-foreground">{successRate}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.quizzesPassed || 0} réussis sur {stats?.totalAttempts || 0} tentatives
                </p>
              </div>

              <div className="pt-4">
                <Link to="/quizzes">
                  <Button className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Zap className="h-4 w-4" />
                    Continuer les quiz
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Activité récente
              </CardTitle>
              <CardDescription>Vos derniers quiz</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {recentAttempts.map((attempt, index) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        attempt.passed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{attempt.quizTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {getRelativeTime(attempt.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${
                          attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {attempt.score}%
                        </span>
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          +{attempt.starsEarned}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun quiz complété</p>
                  <Link to="/quizzes">
                    <Button variant="link" className="mt-2">
                      Commencer un quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/themes">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">Thèmes</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/quizzes">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mx-auto mb-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">Quiz</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/leaderboard">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">Classement</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/forum">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">Forum</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
