import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History,
  Trophy,
  Target,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface QuizAttempt {
  id: string;
  quizId: string;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    difficulty: string;
    theme?: {
      title: string;
    };
  };
  score: number;
  starsEarned: number;
  completedAt: string;
}

interface Stats {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  totalStars: number;
  averageScore: number;
  bestScore: number;
}

const difficultyColors: Record<string, string> = {
  FACILE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  MOYEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DIFFICILE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quizzes/attempts');
        const attemptsData = response.data;

        setAttempts(attemptsData);

        // Calculate stats
        const passed = attemptsData.filter((a: QuizAttempt) => a.score >= a.quiz.passingScore);
        const failed = attemptsData.filter((a: QuizAttempt) => a.score < a.quiz.passingScore);
        const totalStars = attemptsData.reduce((sum: number, a: QuizAttempt) => sum + a.starsEarned, 0);
        const totalScore = attemptsData.reduce((sum: number, a: QuizAttempt) => sum + a.score, 0);
        const bestScore = attemptsData.length > 0 ? Math.max(...attemptsData.map((a: QuizAttempt) => a.score)) : 0;

        setStats({
          totalAttempts: attemptsData.length,
          passedAttempts: passed.length,
          failedAttempts: failed.length,
          totalStars,
          averageScore: attemptsData.length > 0 ? Math.round(totalScore / attemptsData.length) : 0,
          bestScore,
        });
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredAttempts(attempts);
    } else if (filter === 'passed') {
      setFilteredAttempts(attempts.filter(a => a.score >= a.quiz.passingScore));
    } else {
      setFilteredAttempts(attempts.filter(a => a.score < a.quiz.passingScore));
    }
  }, [filter, attempts]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
        </div>
        <p className="mt-4 text-muted-foreground">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <History className="h-6 w-6" />
            </div>
            Historique des Quiz
          </h1>
          <p className="text-muted-foreground mt-1">
            Consultez toutes vos tentatives de quiz
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Tentatives</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold">{stats.passedAttempts}</p>
                <p className="text-xs text-muted-foreground">Réussites</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50">
              <CardContent className="pt-6 text-center">
                <XCircle className="h-8 w-8 mx-auto text-rose-600 dark:text-rose-400 mb-2" />
                <p className="text-2xl font-bold">{stats.failedAttempts}</p>
                <p className="text-xs text-muted-foreground">Échecs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50">
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400 mb-2 fill-amber-500" />
                <p className="text-2xl font-bold">{stats.totalStars}</p>
                <p className="text-xs text-muted-foreground">Étoiles gagnées</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/50 dark:to-sky-950/50">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
                <p className="text-2xl font-bold">{stats.bestScore}%</p>
                <p className="text-xs text-muted-foreground">Meilleur score</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Filter and List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Toutes les tentatives</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {filter === 'all' ? 'Toutes' : filter === 'passed' ? 'Réussites' : 'Échecs'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                Toutes les tentatives
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('passed')}>
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                Réussites uniquement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('failed')}>
                <XCircle className="h-4 w-4 mr-2 text-rose-500" />
                Échecs uniquement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune tentative</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? "Vous n'avez pas encore tenté de quiz."
                  : filter === 'passed'
                    ? "Vous n'avez pas encore réussi de quiz."
                    : "Vous n'avez pas encore échoué de quiz. Bravo !"}
              </p>
              <Link to="/quizzes">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  Découvrir les quiz
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {filteredAttempts.map((attempt) => {
                const passed = attempt.score >= attempt.quiz.passingScore;
                return (
                  <motion.div key={attempt.id} variants={item}>
                    <Link to={`/quizzes/${attempt.quizId}`}>
                      <div
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer',
                          passed
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-300'
                            : 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-300'
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
                                passed
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                  : 'bg-rose-100 dark:bg-rose-900/50'
                              )}
                            >
                              {passed ? (
                                <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold truncate">{attempt.quiz.title}</h4>
                                <Badge className={cn('text-xs', difficultyColors[attempt.quiz.difficulty])}>
                                  {attempt.quiz.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {attempt.quiz.theme && (
                                  <span className="truncate">{attempt.quiz.theme.title}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {getRelativeTime(attempt.completedAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            {/* Score */}
                            <div className="text-center">
                              <div className={cn(
                                'text-2xl font-bold',
                                passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              )}>
                                {attempt.score}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                min. {attempt.quiz.passingScore}%
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-amber-700 dark:text-amber-400">
                                +{attempt.starsEarned}
                              </span>
                            </div>

                            {/* Progress bar mini */}
                            <div className="w-20 hidden sm:block">
                              <Progress
                                value={attempt.score}
                                className={cn(
                                  'h-2',
                                  passed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-rose-500'
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
