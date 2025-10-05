import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2, Download, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { importConversation, type ExportedConversation } from '@/lib/conversationImport';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

const MAX_CONVERSATIONS = 10;

export const ChatHistory = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation
}: ChatHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(MAX_CONVERSATIONS);

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (conversations.length >= MAX_CONVERSATIONS) {
      toast({
        title: "Conversation Limit Reached",
        description: `You can only have ${MAX_CONVERSATIONS} conversations. Please delete one to create a new chat.`,
        variant: "destructive"
      });
      return;
    }
    onNewConversation();
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationToDelete));

      if (currentConversationId === conversationToDelete) {
        onNewConversation();
      }

      toast({
        title: "Chat Deleted",
        description: "Conversation removed permanently"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const exportConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (convError) throw convError;

      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      // Get files
      const { data: files, error: filesError } = await supabase
        .from('conversation_files')
        .select('*')
        .eq('conversation_id', id);

      if (filesError) throw filesError;

      // Create export data
      const exportData = {
        conversation,
        messages,
        files,
        exportedAt: new Date().toISOString()
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversation.title.slice(0, 30)}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Conversation exported with all files"
      });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const exportData: ExportedConversation = JSON.parse(text);

      const result = await importConversation(exportData);

      if (result.success && result.conversationId) {
        await loadConversations();
        onSelectConversation(result.conversationId);
        toast({
          title: "Import Successful",
          description: "Conversation imported successfully"
        });
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing conversation:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import conversation. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) return 'Today';
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col h-full">
        <div className="p-4 border-b border-border/50 space-y-2">
          <Button
            onClick={handleNewConversation}
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
            disabled={conversations.length >= MAX_CONVERSATIONS}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
          <Button
            onClick={handleImportClick}
            variant="outline"
            className="w-full gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Chat
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          {conversations.length >= MAX_CONVERSATIONS && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <AlertCircle className="w-3 h-3" />
              <span>Limit reached ({MAX_CONVERSATIONS})</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground text-center">
            {conversations.length} / {MAX_CONVERSATIONS} chats
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Loading chats...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/80 ${
                    currentConversationId === conv.id
                      ? 'bg-primary/20 border border-primary/30'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:text-blue-500"
                        onClick={(e) => exportConversation(conv.id, e)}
                        title="Export conversation"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(conv.id, e)}
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation along with all messages and files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteConversation} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
