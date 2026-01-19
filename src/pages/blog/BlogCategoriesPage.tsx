import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FolderOpen,
  Trash2,
  Loader2,
  Tag,
  FileText,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { BlogCategory, Tag as TagType } from '@/types';

export function BlogCategoriesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Tag dialog state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');

  const fetchData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        api.get('/blog/categories'),
        api.get('/blog/tags'),
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCategory(true);

    try {
      await api.post('/blog/categories', { name: categoryName });
      toast({ title: 'Catégorie créée avec succès' });
      setIsCategoryDialogOpen(false);
      setCategoryName('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await api.delete(`/blog/categories/${id}`);
      toast({ title: 'Catégorie supprimée avec succès' });
      fetchData();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTag(true);

    try {
      await api.post('/blog/tags', { name: tagName });
      toast({ title: 'Tag créé avec succès' });
      setIsTagDialogOpen(false);
      setTagName('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) return;

    try {
      await api.delete(`/blog/tags/${id}`);
      toast({ title: 'Tag supprimé avec succès' });
      fetchData();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le tag',
        variant: 'destructive',
      });
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-muted-foreground">
              Cette page est réservée aux administrateurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Blog</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les catégories et les tags du blog
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'categories'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Catégories ({categories.length})
          </span>
          {activeTab === 'categories' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'tags'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags ({tags.length})
          </span>
          {activeTab === 'tags' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Rechercher ${activeTab === 'categories' ? 'une catégorie' : 'un tag'}...`}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => activeTab === 'categories' ? setIsCategoryDialogOpen(true) : setIsTagDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'categories' ? 'Nouvelle catégorie' : 'Nouveau tag'}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'categories' ? (
        // Categories list
        filteredCategories.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune catégorie</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Aucun résultat pour cette recherche' : 'Créez votre première catégorie'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card className="group border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <FolderOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription className="text-xs">
                              /{category.slug}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{category._count?.articles || 0} article(s)</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        // Tags list
        filteredTags.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucun tag</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Aucun résultat pour cette recherche' : 'Créez votre premier tag'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Badge
                    variant="secondary"
                    className="group text-base py-2 px-4 gap-2 hover:bg-secondary/80"
                  >
                    <Tag className="h-4 w-4" />
                    {tag.name}
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie pour organiser vos articles
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nom de la catégorie</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Tutoriels, Actualités..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Le slug sera généré automatiquement
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmittingCategory} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {isSubmittingCategory ? (
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

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tag</DialogTitle>
            <DialogDescription>
              Créez un nouveau tag pour catégoriser vos articles
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTag}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">Nom du tag</Label>
                <Input
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: JavaScript, React..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmittingTag} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {isSubmittingTag ? (
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
