import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  HelpCircle,
  Clock,
  Target,
  Star,
  Play,
  Edit,
  Trash2,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { MiniEditor } from '@/components/editor/MiniEditor';
import type { Theme } from '@/types';

interface QuizWithCount {
  id: string;
  themeId: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  theme?: { id: string; title: string };
  _count?: { questions: number };
}

const difficultyColors = {
  FACILE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MOYEN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  DIFFICILE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

export function QuizzesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithCount | null>(null);
  const [formData, setFormData] = useState({
    themeId: '',
    title: '',
    description: '',
    difficulty: 'FACILE' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    timeLimit: 30,
    passingScore: 70,
    isFree: true,
  });

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [quizzesRes, themesRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/themes'),
      ]);
      setQuizzes(quizzesRes.data);
      setThemes(themesRes.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (quiz?: QuizWithCount) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        themeId: quiz.themeId,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isFree: quiz.isFree,
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        themeId: themes[0]?.id || '',
        title: '',
        description: '',
        difficulty: 'FACILE',
        timeLimit: 30,
        passingScore: 70,
        isFree: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingQuiz) {
        await api.patch(`/quizzes/${editingQuiz.id}`, formData);
        toast({ title: 'Quiz modifié avec succès' });
      } else {
        await api.post('/quizzes', formData);
        toast({ title: 'Quiz créé avec succès' });
      }
      setIsDialogOpen(false);
      fetchData(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      await api.delete(`/quizzes/${id}`);
      toast({ title: 'Quiz supprimé avec succès' });
      fetchData(false);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le quiz',
        variant: 'destructive',
      });
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      quiz.title.toLowerCase().includes(searchLower) ||
      (quiz.description || '').toLowerCase().includes(searchLower);
    const matchesDifficulty =
      !filterDifficulty ||
      quiz.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Testez vos connaissances avec nos quiz interactifs
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenDialog()} variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau quiz
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un quiz..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterDifficulty === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterDifficulty('')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Tous
          </Button>
          {['FACILE', 'MOYEN', 'DIFFICILE'].map((diff) => (
            <Button
              key={diff}
              variant={filterDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterDifficulty(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun quiz trouvé</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer un quiz'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredQuizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={item}>
              <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            difficultyColors[quiz.difficulty]
                          )}
                        >
                          {quiz.difficulty}
                        </span>
                        {quiz.isFree ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Gratuit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Premium
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {quiz.theme?.title}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(quiz)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(quiz.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div
                    className="text-sm text-muted-foreground line-clamp-2 mb-4 prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
                    dangerouslySetInnerHTML={{ __html: quiz.description }}
                  />
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{quiz.passingScore}% requis</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>{quiz._count?.questions || 0} Q</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant="gradient"
                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Commencer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? 'Modifier le quiz' : 'Nouveau quiz'}
            </DialogTitle>
            <DialogDescription>
              {editingQuiz
                ? 'Modifiez les informations du quiz'
                : 'Créez un nouveau quiz interactif'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="themeId">Thème</Label>
                <select
                  id="themeId"
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm"
                  value={formData.themeId}
                  onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Quiz JavaScript Avancé"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <MiniEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Description du quiz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <select
                    id="difficulty"
                    className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as 'FACILE' | 'MOYEN' | 'DIFFICILE',
                      })
                    }
                  >
                    <option value="FACILE">Facile</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="DIFFICILE">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Temps (min)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Score requis (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant={formData.isFree ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isFree: true })}
                    >
                      Gratuit
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isFree ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isFree: false })}
                    >
                      Premium
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuiz ? 'Modification...' : 'Création...'}
                  </>
                ) : editingQuiz ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
