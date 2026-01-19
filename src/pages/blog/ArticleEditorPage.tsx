import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  Loader2,
  Upload,
  X,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { BlogCategory, Tag as TagType, Article } from '@/types';

export function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    category: true,
    tags: true,
    featuredImage: true,
    excerpt: true,
  });

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        api.get('/blog/categories'),
        api.get('/blog/tags'),
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);

      if (isEditing) {
        const articleRes = await api.get(`/blog/articles/${id}`);
        const article: Article = articleRes.data;
        setTitle(article.title);
        setContent(article.content);
        setExcerpt(article.excerpt || '');
        setCoverImage(article.coverImage || '');
        setCategoryId(article.categoryId);
        setSelectedTags(article.tags?.map((t) => t.id) || []);
        setPublished(article.published);
      }
    } catch (error) {
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
  }, [id]);

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCoverImage(response.data.url);
      toast({ title: 'Image téléchargée avec succès' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger l\'image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  }, []);

  const handleSave = async (shouldPublish?: boolean) => {
    if (!title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre est requis',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une catégorie',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le contenu est requis',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        categoryId,
        tagIds: selectedTags,
        published: shouldPublish !== undefined ? shouldPublish : published,
      };

      if (isEditing) {
        await api.patch(`/blog/articles/${id}`, payload);
        toast({ title: 'Article mis à jour avec succès' });
      } else {
        const response = await api.post('/blog/articles', payload);
        toast({ title: 'Article créé avec succès' });
        navigate(`/blog/edit/${response.data.id}`);
      }

      if (shouldPublish !== undefined) {
        setPublished(shouldPublish);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent créer ou modifier des articles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">
                {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {published ? 'Publié' : 'Brouillon'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showSidebar ? 'Masquer' : 'Options'}
            </Button>
            {published ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Dépublier
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                <Eye className="h-4 w-4 mr-2" />
                Publier
              </Button>
            )}
            <Button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main editor area */}
        <div className={cn('flex-1 p-6 transition-all', showSidebar ? 'lg:mr-80' : '')}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'article"
                className="text-3xl font-bold border-0 border-b rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Content Editor */}
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Commencez à écrire votre article..."
              minHeight="500px"
            />
          </div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ x: showSidebar ? 0 : 320 }}
          className={cn(
            'fixed right-0 top-[57px] bottom-0 w-80 bg-background border-l overflow-y-auto',
            'hidden lg:block'
          )}
        >
          <div className="p-4 space-y-4">
            {/* Status */}
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection('status')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Statut
                  </CardTitle>
                  {expandedSections.status ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.status && (
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Publication</p>
                      <p className="text-xs text-muted-foreground">
                        {published ? 'Visible publiquement' : 'Brouillon non visible'}
                      </p>
                    </div>
                    <Switch
                      checked={published}
                      onCheckedChange={setPublished}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Category */}
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection('category')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Catégorie
                  </CardTitle>
                  {expandedSections.category ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.category && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                          categoryId === category.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={categoryId === category.id}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Aucune catégorie disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection('tags')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags ({selectedTags.length})
                  </CardTitle>
                  {expandedSections.tags ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.tags && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Aucun tag disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection('featuredImage')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image de couverture
                  </CardTitle>
                  {expandedSections.featuredImage ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.featuredImage && (
                <CardContent className="pt-0">
                  {coverImage ? (
                    <div className="relative group">
                      <img
                        src={coverImage}
                        alt="Couverture"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setCoverImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      {isUploadingCover ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span className="text-sm">Ajouter une image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </CardContent>
              )}
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection('excerpt')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Extrait
                  </CardTitle>
                  {expandedSections.excerpt ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.excerpt && (
                <CardContent className="pt-0">
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Résumé de l'article (optionnel)"
                    rows={4}
                    className="w-full text-sm p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Ce texte sera affiché dans les aperçus et les partages
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <Button
          onClick={() => setShowSidebar(!showSidebar)}
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-background overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Options de l'article</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {/* Same content as desktop sidebar */}
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Statut</Label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">
                    {published ? 'Publié' : 'Brouillon'}
                  </span>
                  <Switch checked={published} onCheckedChange={setPublished} />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catégorie</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 rounded-lg border bg-background"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Image de couverture</Label>
                {coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Couverture"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    {isUploadingCover ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">Ajouter</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Extrait</Label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Résumé de l'article..."
                  rows={3}
                  className="w-full text-sm p-3 rounded-lg border bg-background resize-none"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
