import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MessageSquare,
  MessageCircle,
  Calendar,
  User,
  Trash2,
  Loader2,
  CheckCircle,
  Lock,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
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
import type { ForumTopic, ForumCategory } from '@/types';

const statusConfig = {
  OUVERT: { icon: Circle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Ouvert' },
  FERME: { icon: Lock, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Fermé' },
  RESOLU: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Résolu' },
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

export function ForumPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    content: '',
  });

  const fetchData = async () => {
    try {
      const [topicsRes, categoriesRes] = await Promise.all([
        api.get('/forum/topics'),
        api.get('/forum/categories'),
      ]);
      setTopics(topicsRes.data);
      setCategories(categoriesRes.data);
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

  const handleOpenDialog = () => {
    setFormData({
      categoryId: categories[0]?.id || '',
      title: '',
      content: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/forum/topics', formData);
      toast({ title: 'Discussion créée avec succès' });
      setIsDialogOpen(false);
      fetchData();
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discussion ?')) return;

    try {
      await api.delete(`/forum/topics/${id}`);
      toast({ title: 'Discussion supprimée avec succès' });
      fetchData();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la discussion',
        variant: 'destructive',
      });
    }
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || topic.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || topic.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Échangez avec la communauté
          </p>
        </div>
        <Button onClick={handleOpenDialog} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle discussion
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une discussion..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            Toutes catégories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('')}
          >
            Tous
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedStatus === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(key)}
            >
              <config.icon className={cn('mr-1 h-3 w-3', config.color)} />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune discussion trouvée</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez une nouvelle discussion'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredTopics.map((topic) => {
            const status = statusConfig[topic.status];
            const StatusIcon = status.icon;
            const canDelete = isAdmin || topic.authorId === user?.id;

            return (
              <motion.div key={topic.id} variants={item}>
                <Card
                  className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/forum/${topic.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', status.bg)}>
                        <StatusIcon className={cn('h-6 w-6', status.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {topic.category?.name}
                              </span>
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.bg, status.color)}>
                                {status.label}
                              </span>
                            </div>
                            <CardTitle className="text-lg mb-1">{topic.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {topic.content}
                            </CardDescription>
                          </div>
                          {canDelete && (
                            <div
                              className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(topic.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {topic.author?.firstName} {topic.author?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(topic.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{topic._count?.comments || 0} réponses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle discussion</DialogTitle>
            <DialogDescription>
              Posez une question ou partagez une idée avec la communauté
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Catégorie</Label>
                <select
                  id="categoryId"
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
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
                  placeholder="Titre de votre discussion"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <textarea
                  id="content"
                  className="flex min-h-[150px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez votre question ou idée..."
                  required
                />
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
                    Création...
                  </>
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
