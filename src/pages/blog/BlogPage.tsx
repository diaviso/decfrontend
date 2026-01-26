import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Edit,
  Trash2,
  Loader2,
  Eye,
  Settings,
  FolderOpen,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { Article, BlogCategory } from '@/types';

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

export function BlogPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDrafts, setShowDrafts] = useState(false);

  const fetchData = async () => {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/blog/articles'),
        api.get('/blog/categories'),
      ]);
      setArticles(articlesRes.data);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await api.delete(`/blog/articles/${id}`);
      toast({ title: 'Article supprimé avec succès' });
      fetchData();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article',
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (articleId: string) => {
    try {
      await api.post(`/blog/articles/${articleId}/like`);
      fetchData();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de liker l\'article',
        variant: 'destructive',
      });
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
    const matchesDraft = isAdmin ? (showDrafts ? !article.published : article.published) : article.published;
    return matchesSearch && matchesCategory && matchesDraft;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const draftCount = articles.filter((a) => !a.published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">Blog</h1>
          <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
            Découvrez nos articles et tutoriels
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/blog/categories')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Catégories & Tags
            </Button>
            <Button
              onClick={() => navigate('/blog/new')}
              className="bg-[#1B5E3D] hover:bg-[#144832] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel article
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            Tous
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
              {cat._count?.articles !== undefined && (
                <span className="ml-1 text-xs opacity-70">({cat._count.articles})</span>
              )}
            </Button>
          ))}
          {isAdmin && draftCount > 0 && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              <Button
                variant={showDrafts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDrafts(!showDrafts)}
                className="gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Brouillons ({draftCount})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun article trouvé</p>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Essayez une autre recherche' : showDrafts ? 'Aucun brouillon' : 'Commencez par créer un article'}
            </p>
            {isAdmin && !searchQuery && (
              <Button onClick={() => navigate('/blog/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un article
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredArticles.map((article) => (
            <motion.div key={article.id} variants={item}>
              <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Draft badge */}
                {!article.published && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Brouillon
                    </Badge>
                  </div>
                )}

                {article.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-[#1B5E3D]/20 to-[#3D9A6A]/20 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-[#5A7265]/50" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-[#1B5E3D]/10 text-[#1B5E3D] dark:text-[#3D9A6A] border-[#1B5E3D]/20">
                          <FolderOpen className="h-3 w-3 mr-1" />
                          {article.category?.name}
                        </Badge>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex gap-1">
                            {article.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {article.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{article.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/blog/edit/${article.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {article.excerpt && (
                    <CardDescription className="line-clamp-3 mb-4">
                      {article.excerpt}
                    </CardDescription>
                  )}

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="truncate">
                          {article.author?.firstName} {article.author?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(article.id);
                          }}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span>{article._count?.likes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{article._count?.comments || 0}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/blog/${article.slug}`)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Lire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
