import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const suggestedQuestions = [
  {
    category: 'Déontologie',
    icon: BookOpen,
    color: 'bg-[#1B5E3D]',
    questions: [
      "Quels sont les 5 principes fondamentaux de déontologie ?",
      "Qu'est-ce que le secret professionnel ?",
    ],
  },
  {
    category: 'DEC',
    icon: Sparkles,
    color: 'bg-[#F5A623]',
    questions: [
      "Quelles sont les épreuves du DEC ?",
      "Comment rédiger un mémoire ?",
    ],
  },
  {
    category: 'Application',
    icon: HelpCircle,
    color: 'bg-[#2D7A50]',
    questions: [
      "Comment fonctionne le système de points ?",
      "Comment passer un quiz ?",
    ],
  },
];

export function ChatbotPage() {
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Streaming non supporté');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
              if (data.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de contacter l\'assistant',
        variant: 'destructive',
      });
      // Remove the assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-[#D1DDD6] dark:border-[#2D3F35] mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1B5E3D] via-[#2D7A50] to-[#3D9A6A] flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3D9A6A] rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">DEC Assistant</h1>
            <p className="text-xs sm:text-sm text-[#5A7265] dark:text-[#8BA898] hidden sm:block">
              Déontologie, DEC & Application
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </Button>
        )}
      </div>

      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-1"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center">
            {/* Welcome */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B5E3D] via-[#2D7A50] to-[#3D9A6A] mb-3 shadow-xl"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold mb-1"
              >
                Bienvenue !
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground max-w-md mx-auto"
              >
                Posez-moi vos questions sur la déontologie, le DEC ou l'application.
              </motion.p>
            </div>

            {/* Suggestions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto w-full"
            >
              {suggestedQuestions.map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('p-1.5 rounded-lg', category.color)}>
                      <category.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-medium text-sm">{category.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {category.questions.map((question, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSuggestionClick(question)}
                        className="w-full text-left p-2.5 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-all text-xs sm:text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-3 rounded-lg bg-[#1B5E3D]/10 border border-[#1B5E3D]/20 max-w-2xl mx-auto"
            >
              <div className="flex gap-2 text-xs sm:text-sm">
                <Info className="h-4 w-4 text-[#1B5E3D] dark:text-[#3D9A6A] flex-shrink-0 mt-0.5" />
                <p className="text-[#5A7265] dark:text-[#8BA898]">
                  <span className="font-medium text-[#1B5E3D] dark:text-[#3D9A6A]">Conseil :</span>{' '}
                  Posez des questions précises pour de meilleures réponses.
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-2 sm:gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1B5E3D] via-[#2D7A50] to-[#3D9A6A] flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-code:text-xs">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content || (message.isStreaming ? '▊' : '')}
                        </ReactMarkdown>
                        {message.isStreaming && message.content && (
                          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p
                      className={cn(
                        'text-[10px] mt-1.5',
                        message.role === 'user'
                          ? 'text-primary-foreground/70 text-right'
                          : 'text-muted-foreground'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F5A623] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 sm:gap-3"
              >
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1B5E3D] via-[#2D7A50] to-[#3D9A6A] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Réflexion...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t pt-3 mt-auto bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl bg-[#1B5E3D] hover:bg-[#144832]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Entrée pour envoyer • Shift+Entrée pour saut de ligne
        </p>
      </div>
    </div>
  );
}
