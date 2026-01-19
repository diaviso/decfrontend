import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Calendar,
  Send,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    likes: number;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    id: string;
    name: string;
  };
  tags: { id: string; name: string }[];
  comments: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/blog/articles/slug/${slug}`);
      setArticle(response.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'article',
        variant: 'destructive',
      });
      navigate('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const handleLikeArticle = async () => {
    if (!article) return;
    try {
      await api.post(`/blog/articles/${article.id}/like`);
      fetchArticle();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de liker l\'article',
        variant: 'destructive',
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/blog/comments/${commentId}/like`);
      fetchArticle();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de liker le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await api.post('/blog/comments', {
        articleId: article.id,
        content: newComment,
      });
      setNewComment('');
      toast({ title: 'Commentaire ajouté' });
      fetchArticle();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;

    try {
      await api.patch(`/blog/comments/${commentId}`, {
        content: editingCommentContent,
      });
      setEditingCommentId(null);
      setEditingCommentContent('');
      toast({ title: 'Commentaire modifié' });
      fetchArticle();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await api.delete(`/blog/comments/${commentId}`);
      toast({ title: 'Commentaire supprimé' });
      fetchArticle();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/blog')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Retour au blog</span>
      </div>

      {/* Article */}
      <article>
        {/* Cover image */}
        {article.coverImage && (
          <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {article.category.name}
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        {/* Author info */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(article.author.firstName, article.author.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {article.author.firstName} {article.author.lastName}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 py-6 border-t border-b">
          <button
            onClick={handleLikeArticle}
            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="h-5 w-5" />
            <span>{article._count?.likes || 0} J'aime</span>
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{article._count?.comments || 0} Commentaires</span>
          </div>
        </div>
      </article>

      {/* Comments section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Commentaires ({article.comments.length})</h2>

        {/* New comment form */}
        {user && (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitComment} className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <textarea
                    className="w-full min-h-[100px] p-4 rounded-xl border-2 border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Écrivez un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="gradient" disabled={isSubmittingComment}>
                      {isSubmittingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Publier
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Comments list */}
        {article.comments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucun commentaire</p>
              <p className="text-muted-foreground">Soyez le premier à commenter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {article.comments.map((comment, index) => {
              const canEdit = user?.id === comment.user.id || isAdmin;

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(comment.user.firstName, comment.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {comment.user.firstName} {comment.user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                            {canEdit && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentContent(comment.content);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            className="w-full min-h-[80px] p-3 rounded-xl border-2 border-input bg-background text-sm resize-none"
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleUpdateComment(comment.id)}
                            >
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground mb-3">{comment.content}</p>
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                            <span>{comment._count?.likes || 0}</span>
                          </button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
