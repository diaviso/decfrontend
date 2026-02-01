import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Trophy,
  RotateCcw,
  Sparkles,
  BookOpen,
  Crown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Option {
  id: string;
  content: string;
  isCorrect?: boolean;
  explanation?: string;
  wasSelected?: boolean;
}

interface Question {
  id: string;
  content: string;
  type: 'QCM' | 'QCU';
  quizTitle: string;
  themeTitle?: string;
  options: Option[];
}

interface RevisionQuiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  isRevisionQuiz: boolean;
  questions: Question[];
}

interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  results: {
    questionId: string;
    content: string;
    type: string;
    quizTitle: string;
    themeTitle?: string;
    userAnswers: string[];
    isCorrect: boolean;
    options: Option[];
  }[];
}

export default function RevisionQuizPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<RevisionQuiz | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);

  const fetchRevisionQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/quizzes/revision/random');
      setQuiz(response.data);
      setTimeLeft(response.data.timeLimit * 60);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 403) {
        toast({
          title: 'Accès réservé',
          description: 'Cette fonctionnalité est réservée aux utilisateurs premium',
          variant: 'destructive',
        });
        navigate('/premium');
      } else {
        toast({
          title: 'Erreur',
          description: err.response?.data?.message || 'Impossible de charger le quiz de révision',
          variant: 'destructive',
        });
        navigate('/quizzes');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    if (!user?.isPremium) {
      toast({
        title: 'Accès réservé',
        description: 'Cette fonctionnalité est réservée aux utilisateurs premium',
        variant: 'destructive',
      });
      navigate('/premium');
      return;
    }
    fetchRevisionQuiz();
  }, [user, navigate, toast, fetchRevisionQuiz]);

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleStartQuiz = () => {
    setIsPlaying(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setShowCorrection(false);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'QCU') {
      setAnswers({ ...answers, [questionId]: [optionId] });
    } else {
      const current = answers[questionId] || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [questionId]: current.filter((id) => id !== optionId) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, optionId] });
      }
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    setIsPlaying(false);

    try {
      const response = await api.post('/quizzes/revision/submit', { answers });
      setResult(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre le quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setShowCorrection(false);
    setAnswers({});
    fetchRevisionQuiz();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E3D]" />
      </div>
    );
  }

  if (!quiz) return null;

  // Result view
  if (result && !showCorrection) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className={cn(
            'mx-auto w-32 h-32 rounded-full flex items-center justify-center',
            result.passed
              ? 'bg-gradient-to-br from-emerald-400 to-green-600'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
          )}>
            {result.passed ? (
              <Trophy className="h-16 w-16 text-white" />
            ) : (
              <BookOpen className="h-16 w-16 text-white" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {result.passed ? 'Bravo !' : 'Continue tes efforts !'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {result.passed
                ? 'Tu maîtrises bien ces notions'
                : 'La révision régulière est la clé du succès'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-5xl font-bold mb-2" style={{
              background: result.passed
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #F59E0B, #EF4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {result.score}%
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {result.correctCount} / {result.totalQuestions} réponses correctes
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">
                Quiz d'entraînement - Pas d'étoiles gagnées, pas d'historique enregistré
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handleRetry}
              className="gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Nouveau quiz
            </Button>
            <Button
              size="lg"
              onClick={() => setShowCorrection(true)}
              className="bg-[#1B5E3D] hover:bg-[#144832] text-white gap-2"
            >
              <BookOpen className="h-5 w-5" />
              Voir la correction
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Correction view
  if (showCorrection && result) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowCorrection(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Correction</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Score : {result.score}% ({result.correctCount}/{result.totalQuestions})
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {result.results.map((questionResult, index) => (
            <motion.div
              key={questionResult.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'border-2 shadow-lg overflow-hidden',
                questionResult.isCorrect
                  ? 'border-emerald-300 dark:border-emerald-700'
                  : 'border-rose-300 dark:border-rose-700'
              )}>
                <div className={cn(
                  'h-1',
                  questionResult.isCorrect
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                    : 'bg-gradient-to-r from-rose-400 to-red-500'
                )} />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shrink-0',
                      questionResult.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                    )}>
                      {questionResult.isCorrect ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {questionResult.themeTitle}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {questionResult.quizTitle}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium text-slate-900 dark:text-white">
                        {index + 1}. {questionResult.content}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questionResult.options.map((option, idx) => (
                      <div
                        key={option.id}
                        className={cn(
                          'p-4 rounded-xl border-2 text-sm',
                          option.isCorrect
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700'
                            : option.wasSelected
                              ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/30 dark:border-rose-700'
                              : 'border-muted bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                            option.isCorrect
                              ? 'bg-emerald-500 text-white'
                              : option.wasSelected
                                ? 'bg-rose-500 text-white'
                                : 'bg-muted'
                          )}>
                            {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                          </span>
                          <span className="flex-1 font-medium">{option.content}</span>
                          {option.isCorrect && (
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          )}
                          {option.wasSelected && !option.isCorrect && (
                            <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        {option.explanation && (
                          <div className={cn(
                            'mt-3 pt-3 border-t text-sm',
                            option.isCorrect
                              ? 'border-emerald-200 dark:border-emerald-700/50'
                              : 'border-rose-200 dark:border-rose-700/50'
                          )}>
                            <div className="flex items-start gap-2">
                              <Lightbulb className={cn(
                                'h-4 w-4 mt-0.5 flex-shrink-0',
                                option.isCorrect
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-500 dark:text-rose-400'
                              )} />
                              <p className={cn(
                                option.isCorrect
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-rose-600 dark:text-rose-300'
                              )}>
                                {option.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleRetry}
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Nouveau quiz
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/quizzes')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            Retour aux quiz
          </Button>
        </div>
      </div>
    );
  }

  // Quiz playing view
  if (isPlaying) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Révision
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold',
            timeLeft <= 60
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-[#1B5E3D]/10 text-[#1B5E3D] dark:text-[#3D9A6A]'
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-2 border-[#1B5E3D]/20 shadow-xl">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.themeTitle}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.quizTitle}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{currentQuestion.content}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion.id]?.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                          isSelected
                            ? 'border-[#1B5E3D] bg-[#1B5E3D]/10 dark:bg-[#1B5E3D]/20'
                            : 'border-muted hover:border-[#1B5E3D]/50 hover:bg-muted/50'
                        )}
                      >
                        <span className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors',
                          isSelected
                            ? 'bg-[#1B5E3D] text-white'
                            : 'bg-muted'
                        )}>
                          {currentQuestion.type === 'QCU' ? (
                            isSelected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />
                          ) : (
                            ['A', 'B', 'C', 'D', 'E', 'F'][idx]
                          )}
                        </span>
                        <span className="flex-1">{option.content}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          <span className="text-sm text-muted-foreground">
            {answeredCount} / {quiz.questions.length} répondues
          </span>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="bg-[#1B5E3D] hover:bg-[#144832] text-white"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount === 0}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
            >
              {isSubmitting ? 'Envoi...' : 'Terminer'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/quizzes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Réviser la DEC</h1>
          <p className="text-slate-600 dark:text-slate-400">Quiz d'entraînement aléatoire</p>
        </div>
      </div>

      <Card className="border-2 border-[#1B5E3D]/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Quiz de Révision
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              10 questions aléatoires piochées dans tous les thèmes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#1B5E3D]">10</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#1B5E3D]">5 min</div>
              <div className="text-sm text-muted-foreground">Temps limite</div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
              <Crown className="h-5 w-5" />
              <span>Mode entraînement</span>
            </div>
            <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1 ml-7">
              <li>• Questions variées de tous les thèmes</li>
              <li>• Pas d'étoiles gagnées</li>
              <li>• Pas d'historique enregistré</li>
              <li>• Correction disponible à la fin</li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={handleStartQuiz}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg py-6"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Commencer la révision
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
