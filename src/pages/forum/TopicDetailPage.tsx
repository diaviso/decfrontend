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
  CheckCircle,
  Lock,
  Circle,
  Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ForumComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  replies?: ForumComment[];
  _count?: {
    likes: number;
  };
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  status: 'OUVERT' | 'FERME' | 'RESOLU';
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
  comments: ForumComment[];
  _count?: {
    comments: number;
  };
}

const statusConfig = {
  OUVERT: { icon: Circle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Ouvert' },
  FERME: { icon: Lock, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Fermé' },
  RESOLU: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Résolu' },
};

export function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchTopic = async () => {
    try {
      const response = await api.get(`/forum/topics/${id}`);
      setTopic(response.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la discussion',
        variant: 'destructive',
      });
      navigate('/forum');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/forum/comments/${commentId}/like`);
      fetchTopic();
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
    if (!topic || !newComment.trim()) return;

    if (topic.status === 'FERME') {
      toast({
        title: 'Discussion fermée',
        description: 'Vous ne pouvez pas commenter une discussion fermée',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      await api.post('/forum/comments', {
        topicId: topic.id,
        content: newComment,
      });
      setNewComment('');
      toast({ title: 'Réponse ajoutée' });
      fetchTopic();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la réponse',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!topic || !replyContent.trim()) return;

    try {
      await api.post('/forum/comments', {
        topicId: topic.id,
        content: replyContent,
        parentCommentId,
      });
      setReplyingToId(null);
      setReplyContent('');
      toast({ title: 'Réponse ajoutée' });
      fetchTopic();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la réponse',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;

    try {
      await api.patch(`/forum/comments/${commentId}`, {
        content: editingCommentContent,
      });
      setEditingCommentId(null);
      setEditingCommentContent('');
      toast({ title: 'Commentaire modifié' });
      fetchTopic();
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
      await api.delete(`/forum/comments/${commentId}`);
      toast({ title: 'Commentaire supprimé' });
      fetchTopic();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (status: 'OUVERT' | 'FERME' | 'RESOLU') => {
    if (!topic) return;

    try {
      await api.patch(`/forum/topics/${topic.id}`, { status });
      toast({ title: 'Statut mis à jour' });
      fetchTopic();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderComment = (comment: ForumComment, isReply = false) => {
    const canEdit = user?.id === comment.user.id || isAdmin;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(isReply && 'ml-12')}
      >
        <Card className={cn('group border-0 shadow-lg', isReply && 'bg-muted/30')}>
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
                  <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>
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
                <p className="text-foreground mb-3 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{comment._count?.likes || 0}</span>
                  </button>
                  {!isReply && topic?.status !== 'FERME' && user && (
                    <button
                      onClick={() => {
                        setReplyingToId(comment.id);
                        setReplyContent('');
                      }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Reply className="h-4 w-4" />
                      <span>Répondre</span>
                    </button>
                  )}
                </div>

                {/* Reply form */}
                {replyingToId === comment.id && (
                  <div className="mt-4 pl-4 border-l-2 border-primary">
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-xl border-2 border-input bg-background text-sm resize-none"
                      placeholder="Votre réponse..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setReplyingToId(null)}>
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => handleSubmitReply(comment.id)}
                      >
                        Répondre
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) return null;

  const status = statusConfig[topic.status];
  const StatusIcon = status.icon;
  const canManage = user?.id === topic.author.id || isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/forum')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Retour au forum</span>
      </div>

      {/* Topic */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {topic.category.name}
                </span>
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1', status.bg, status.color)}>
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </span>
              </div>
              <CardTitle className="text-2xl">{topic.title}</CardTitle>
            </div>

            {/* Status controls */}
            {canManage && (
              <div className="flex gap-2">
                {topic.status !== 'RESOLU' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-500 border-blue-500"
                    onClick={() => handleUpdateStatus('RESOLU')}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Marquer résolu
                  </Button>
                )}
                {topic.status === 'OUVERT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-500"
                    onClick={() => handleUpdateStatus('FERME')}
                  >
                    <Lock className="mr-1 h-4 w-4" />
                    Fermer
                  </Button>
                )}
                {topic.status === 'FERME' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500 border-green-500"
                    onClick={() => handleUpdateStatus('OUVERT')}
                  >
                    <Circle className="mr-1 h-4 w-4" />
                    Rouvrir
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Author info */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(topic.author.firstName, topic.author.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {topic.author.firstName} {topic.author.lastName}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(topic.createdAt)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {topic.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Réponses ({topic._count?.comments || 0})
        </h2>

        {/* New comment form */}
        {user && topic.status !== 'FERME' && (
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
                    placeholder="Écrivez une réponse..."
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

        {topic.status === 'FERME' && (
          <Card className="border-dashed border-red-300 dark:border-red-800">
            <CardContent className="flex items-center justify-center py-6 text-red-500">
              <Lock className="h-5 w-5 mr-2" />
              Cette discussion est fermée aux nouvelles réponses
            </CardContent>
          </Card>
        )}

        {/* Comments list */}
        {topic.comments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune réponse</p>
              <p className="text-muted-foreground">Soyez le premier à répondre</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topic.comments.map((comment) => renderComment(comment))}
          </div>
        )}
      </section>
    </div>
  );
}
