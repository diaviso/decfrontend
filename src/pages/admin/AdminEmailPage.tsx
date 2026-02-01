import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Crown,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  UserCheck,
  ArrowLeft,
  History,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPremium: boolean;
  role: string;
  createdAt: string;
}

interface EmailHistoryItem {
  id: string;
  subject: string;
  htmlContent: string;
  recipientCount: number;
  recipientEmails: string[];
  successCount: number;
  failedCount: number;
  errors: string[];
  sentAt: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Toolbar button component
const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'p-2 rounded-lg transition-colors',
      isActive
        ? 'bg-[#1B5E3D] text-white'
        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
    )}
  >
    {children}
  </button>
);

export default function AdminEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: number;
    failed: number;
    message: string;
  } | null>(null);

  // Filter options
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');

  // History
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/mail/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch email history
  const fetchEmailHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await api.get('/mail/admin/history');
      setEmailHistory(response.data);
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchEmailHistory();
  }, [fetchUsers, fetchEmailHistory]);

  // Filter users based on search and premium filter
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query)
      );
    }

    // Premium filter
    if (filterPremium === 'premium') {
      filtered = filtered.filter((u) => u.isPremium);
    } else if (filterPremium === 'free') {
      filtered = filtered.filter((u) => !u.isPremium);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filterPremium]);

  const handleSelectUser = (userId: string) => {
    if (sendToAll) return;
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleSendToAllChange = (checked: boolean) => {
    setSendToAll(checked);
    if (checked) {
      setSelectedUserIds([]);
    }
  };

  const validateForm = () => {
    if (!subject.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un objet pour l\'email',
        variant: 'destructive',
      });
      return false;
    }

    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir le contenu de l\'email',
        variant: 'destructive',
      });
      return false;
    }

    if (!sendToAll && selectedUserIds.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un destinataire',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handlePreviewSend = () => {
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleSendEmail = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);

    try {
      const response = await api.post('/mail/admin/send', {
        userIds: sendToAll ? undefined : selectedUserIds,
        sendToAll,
        subject,
        htmlContent: editor?.getHTML(),
      });

      setSendResult({
        success: response.data.success,
        failed: response.data.failed,
        message: response.data.message,
      });

      if (response.data.failed === 0) {
        toast({
          title: 'Succès',
          description: response.data.message,
        });
        // Reset form
        setSubject('');
        editor?.commands.setContent('');
        setSelectedUserIds([]);
        setSendToAll(false);
        // Refresh history
        fetchEmailHistory();
      } else {
        toast({
          title: 'Envoi partiel',
          description: response.data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const recipientCount = sendToAll ? users.length : selectedUserIds.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E3D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Envoyer un email
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Envoyez des emails aux utilisateurs vérifiés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Selection */}
        <Card className="lg:col-span-1 border-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#1B5E3D]" />
              Destinataires
            </CardTitle>
            <CardDescription>
              {users.length} utilisateur(s) avec email vérifié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Send to all checkbox */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#1B5E3D]/5 border border-[#1B5E3D]/20">
              <Checkbox
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={handleSendToAllChange}
              />
              <Label
                htmlFor="sendToAll"
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4 text-[#1B5E3D]" />
                Envoyer à tous ({users.length})
              </Label>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={sendToAll}
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <Button
                variant={filterPremium === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPremium('all')}
                disabled={sendToAll}
                className={filterPremium === 'all' ? 'bg-[#1B5E3D] hover:bg-[#144832]' : ''}
              >
                Tous
              </Button>
              <Button
                variant={filterPremium === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPremium('premium')}
                disabled={sendToAll}
                className={filterPremium === 'premium' ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Button>
              <Button
                variant={filterPremium === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPremium('free')}
                disabled={sendToAll}
              >
                Gratuit
              </Button>
            </div>

            {/* Select all button */}
            {!sendToAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="w-full"
              >
                {selectedUserIds.length === filteredUsers.length ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Tout désélectionner
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Tout sélectionner ({filteredUsers.length})
                  </>
                )}
              </Button>
            )}

            {/* User list */}
            <ScrollArea className={cn('rounded-lg border', sendToAll ? 'opacity-50' : '')}>
              <div className="max-h-[400px] p-2 space-y-1">
                {filteredUsers.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                      selectedUserIds.includes(u.id)
                        ? 'bg-[#1B5E3D]/10 border border-[#1B5E3D]/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                      sendToAll && 'pointer-events-none'
                    )}
                    onClick={() => handleSelectUser(u.id)}
                  >
                    {selectedUserIds.includes(u.id) ? (
                      <CheckSquare className="h-4 w-4 text-[#1B5E3D] flex-shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {u.isPremium && (
                      <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Aucun utilisateur trouvé
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Selection count */}
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {recipientCount} destinataire(s) sélectionné(s)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right: Email Composer */}
        <Card className="lg:col-span-2 border-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-[#1B5E3D]" />
              Composer l'email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                placeholder="Objet de l'email..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Editor Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
                title="Gras"
              >
                <span className="font-bold text-sm">B</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
                title="Italique"
              >
                <span className="italic text-sm">I</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive('underline')}
                title="Souligné"
              >
                <span className="underline text-sm">U</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor?.isActive('heading', { level: 2 })}
                title="Titre"
              >
                <span className="font-bold text-sm">H2</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor?.isActive('heading', { level: 3 })}
                title="Sous-titre"
              >
                <span className="font-bold text-sm">H3</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
                title="Liste à puces"
              >
                <span className="text-sm">• —</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor?.isActive('orderedList')}
                title="Liste numérotée"
              >
                <span className="text-sm">1.</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                isActive={editor?.isActive({ textAlign: 'left' })}
                title="Aligner à gauche"
              >
                <span className="text-sm">⫷</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                isActive={editor?.isActive({ textAlign: 'center' })}
                title="Centrer"
              >
                <span className="text-sm">⫶</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                isActive={editor?.isActive({ textAlign: 'right' })}
                title="Aligner à droite"
              >
                <span className="text-sm">⫸</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('URL du lien:');
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                isActive={editor?.isActive('link')}
                title="Ajouter un lien"
              >
                <span className="text-sm">🔗</span>
              </ToolbarButton>
              {editor?.isActive('link') && (
                <ToolbarButton
                  onClick={() => editor?.chain().focus().unsetLink().run()}
                  title="Supprimer le lien"
                >
                  <span className="text-sm">✕</span>
                </ToolbarButton>
              )}
            </div>

            {/* Editor */}
            <div className="border rounded-lg bg-white dark:bg-slate-900 min-h-[300px]">
              <EditorContent editor={editor} />
            </div>

            {/* Send button */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>L'email sera envoyé avec l'en-tête DEC Learning</span>
              </div>
              <Button
                onClick={handlePreviewSend}
                disabled={isSending || recipientCount === 0}
                className="bg-gradient-to-r from-[#1B5E3D] to-[#2D7A50] hover:from-[#144832] hover:to-[#1B5E3D] text-white px-8"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ({recipientCount})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Result */}
      {sendResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            'border-2',
            sendResult.failed === 0
              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
          )}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {sendResult.failed === 0 ? (
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">{sendResult.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {sendResult.success} envoyé(s), {sendResult.failed} échec(s)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSendResult(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Email History Section */}
      <Card className="border-2 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#1B5E3D]" />
              <CardTitle className="text-lg">Historique des emails</CardTitle>
            </div>
            <Badge variant="secondary">{emailHistory.length} envoi(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1B5E3D]" />
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun email envoyé pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      item.failedCount === 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    )}>
                      {item.failedCount === 0 ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.subject}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.sentAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.recipientCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.failedCount === 0 ? 'default' : 'destructive'} className={item.failedCount === 0 ? 'bg-emerald-500' : ''}>
                        {item.successCount}/{item.recipientCount}
                      </Badge>
                      {expandedHistoryId === item.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedHistoryId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="p-4 space-y-4">
                          {/* Sender info */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Envoyé par :</span>
                            <span className="font-medium">
                              {item.sentBy.firstName} {item.sentBy.lastName}
                            </span>
                            <span className="text-muted-foreground">({item.sentBy.email})</span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-[#1B5E3D]">{item.recipientCount}</p>
                              <p className="text-xs text-muted-foreground">Destinataires</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-emerald-500">{item.successCount}</p>
                              <p className="text-xs text-muted-foreground">Succès</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-rose-500">{item.failedCount}</p>
                              <p className="text-xs text-muted-foreground">Échecs</p>
                            </div>
                          </div>

                          {/* Recipients list */}
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Destinataires ({item.recipientEmails.length})
                            </p>
                            <div className="max-h-32 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg p-2 border">
                              <div className="flex flex-wrap gap-1">
                                {item.recipientEmails.map((email, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {email}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Errors if any */}
                          {item.errors && item.errors.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2 text-rose-600">
                                <XCircle className="h-4 w-4" />
                                Erreurs ({item.errors.length})
                              </p>
                              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2 border border-rose-200 dark:border-rose-800">
                                {item.errors.map((error, idx) => (
                                  <p key={idx} className="text-xs text-rose-600 dark:text-rose-400">
                                    {error}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Email content preview */}
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Contenu de l'email
                            </p>
                            <div
                              className="bg-white dark:bg-slate-800 rounded-lg p-4 border prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'envoyer un email à {recipientCount} destinataire(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Objet :</span> {subject}
              </p>
              <p className="text-sm">
                <span className="font-medium">Destinataires :</span>{' '}
                {sendToAll ? 'Tous les utilisateurs vérifiés' : `${recipientCount} utilisateur(s) sélectionné(s)`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Cette action est irréversible</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-[#1B5E3D] hover:bg-[#144832] text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirmer l'envoi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
