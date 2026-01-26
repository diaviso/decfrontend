import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  title: string | null;
  description: string | null;
  fileSize: number;
  mimeType: string;
  totalPages: number | null;
  totalChunks: number;
  isProcessed: boolean;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentChunk {
  id: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}

interface DocumentStats {
  totalDocuments: number;
  processedDocuments: number;
  pendingDocuments: number;
  totalChunks: number;
  totalSizeBytes: number;
  totalSizeMB: string;
}

interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  pageNumber: number | null;
  score: number;
  documentTitle: string | null;
  documentFilename: string;
}

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

export function DocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithChunks | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement des documents',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/documents/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDocuments(), fetchStats()]);
    setLoading(false);
  }, [fetchDocuments, fetchStats]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier PDF',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadTitle) formData.append('title', uploadTitle);
    if (uploadDescription) formData.append('description', uploadDescription);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({
        title: 'Succès',
        description: 'Document uploadé avec succès. Traitement en cours...',
      });
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      // Refresh after a delay to allow processing to start
      setTimeout(fetchAll, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'upload du document",
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await api.delete(`/documents/${documentToDelete}`);
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchAll();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      await api.post(`/documents/${id}/reprocess`);
      toast({
        title: 'Succès',
        description: 'Retraitement lancé avec succès',
      });
      setTimeout(fetchAll, 2000);
    } catch (error) {
      console.error('Reprocess failed:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du retraitement',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await api.get('/documents/search', {
        params: { query: searchQuery, limit: 10 },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la recherche',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleViewDocument = async (id: string) => {
    try {
      const response = await api.get(`/documents/${id}`);
      setSelectedDocument(response.data);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement du document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B5E3D] via-[#144832] to-[#0D3321] p-8 text-white"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#F5A623] text-sm font-medium mb-2">
            <Database className="h-4 w-4" />
            Base de connaissances RAG
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Gestion des documents
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Uploadez vos documents PDF pour enrichir les connaissances de l'assistant IA et améliorer la génération de quiz.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {stats && (
              <>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <FileText className="h-5 w-5 text-[#F5A623]" />
                  <span>{stats.totalDocuments} documents</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <CheckCircle className="h-5 w-5 text-[#F5A623]" />
                  <span>{stats.processedDocuments} traités</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <Database className="h-5 w-5 text-[#F5A623]" />
                  <span>{stats.totalChunks} chunks</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <span>{stats.totalSizeMB} MB total</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F5A623]/20 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-[#F5A623]/10 blur-3xl" />
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Uploader un document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uploader un document PDF</DialogTitle>
              <DialogDescription>
                Le document sera analysé et découpé en chunks pour être utilisé par l'IA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Fichier PDF</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre (optionnel)</Label>
                <Input
                  id="title"
                  placeholder="Ex: Code de déontologie des experts-comptables"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Description du contenu du document..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Uploader
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={fetchAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tester la recherche vectorielle
          </CardTitle>
          <CardDescription>
            Testez la recherche sémantique dans vos documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Posez une question ou entrez des mots-clés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
              {searching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                {searchResults.length} résultats trouvés
              </h4>
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          Score: {(result.score * 100).toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.documentTitle || result.documentFilename}
                        </span>
                        {result.pageNumber && (
                          <span className="text-xs text-muted-foreground">
                            (page {result.pageNumber})
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">{result.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg mb-2">Aucun document</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Uploadez vos premiers documents PDF pour enrichir la base de connaissances de l'IA.
              </p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <motion.div key={doc.id} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                        <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {doc.title || doc.filename}
                        </h3>
                        {doc.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {doc.filename}
                          </p>
                        )}
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {formatFileSize(doc.fileSize)}
                          </Badge>
                          {doc.totalPages && (
                            <Badge variant="outline">
                              {doc.totalPages} pages
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {doc.totalChunks} chunks
                          </Badge>
                          {doc.isProcessed ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Traité
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Ajouté le {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDocument(doc.id)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReprocess(doc.id)}
                        title="Retraiter"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Supprimer"
                        onClick={() => {
                          setDocumentToDelete(doc.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le document ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le document et tous ses chunks seront supprimés définitivement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.title || selectedDocument?.filename}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.totalChunks} chunks extraits du document
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedDocument?.chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Badge variant="outline">Chunk #{chunk.chunkIndex + 1}</Badge>
                    {chunk.pageNumber && (
                      <span>Page {chunk.pageNumber}</span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{chunk.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
