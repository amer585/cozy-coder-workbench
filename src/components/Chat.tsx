import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageSquarePlus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  conversationId?: string;
  filesContext: string;
  onFileOperation?: (operation: string, fileName: string, content?: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  onNewChatRequested?: () => void;
}

export const Chat = ({
  conversationId,
  filesContext,
  onFileOperation,
  onConversationCreated,
  onNewChatRequested
}: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = async (convId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convId,
          role,
          content
        });

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const createConversation = async (firstMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Create conversation if needed
    let activeConvId = conversationId;
    if (!activeConvId) {
      try {
        activeConvId = await createConversation(input);
        onConversationCreated?.(activeConvId);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive"
        });
        return;
      }
    }

    // Include file context in the message
    const contextualInput = `Current Files:\n${filesContext}\n\nUser Question: ${input}`;
    const userMessage: Message = { role: 'user', content: input };
    const contextualMessage: Message = { role: 'user', content: contextualInput };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(activeConvId, 'user', input);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            messages: [...messages.map(m => ({ role: m.role, content: m.content })), contextualMessage]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg?.role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantMessage
                    };
                  } else {
                    newMessages.push({ role: 'assistant', content: assistantMessage });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Save assistant message
      if (activeConvId && assistantMessage) {
        await saveMessage(activeConvId, 'assistant', assistantMessage);
      }

      // Process file operations from AI response
      const fileCreateMatches = assistantMessage.matchAll(/\[FILE_CREATE: (.+?)\]\n([\s\S]*?)\[\/FILE_CREATE\]/g);
      for (const match of fileCreateMatches) {
        const [, fileName, content] = match;
        onFileOperation?.('create', fileName.trim(), content.trim());
      }

      const fileEditMatches = assistantMessage.matchAll(/\[FILE_EDIT: (.+?)\]\n([\s\S]*?)\[\/FILE_EDIT\]/g);
      for (const match of fileEditMatches) {
        const [, fileName, content] = match;
        onFileOperation?.('edit', fileName.trim(), content.trim());
      }

      const fileDeleteMatches = assistantMessage.matchAll(/\[FILE_DELETE: (.+?)\]/g);
      for (const match of fileDeleteMatches) {
        const [, fileName] = match;
        onFileOperation?.('delete', fileName.trim());
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    onNewChatRequested?.();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-secondary/20">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <h2 className="font-semibold text-foreground">AI Code Assistant</h2>
        </div>
        <Button
          onClick={handleNewChat}
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-primary/10 transition-all"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12 animate-fade-in">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Welcome to AI Code Assistant</h3>
              <p className="text-sm mb-4">I can help you with:</p>
              <div className="space-y-2 text-xs max-w-xs mx-auto text-left">
                <div className="p-2 rounded bg-primary/5 border border-primary/10">• Writing and debugging code</div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10">• Creating and editing files</div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10">• Explaining complex concepts</div>
                <div className="p-2 rounded bg-primary/5 border border-primary/10">• Suggesting best practices</div>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`animate-fade-in ${
                msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
              }`}
            >
              <div
                className={`p-4 rounded-lg max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-sm'
                    : 'bg-secondary/80 backdrop-blur-sm border border-border/50'
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return (
                          <div key={i} className="flex gap-2 my-1">
                            <span className="text-primary">•</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (line.includes('**')) {
                        return (
                          <p key={i} dangerouslySetInnerHTML={{
                            __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                          }} />
                        );
                      }
                      return line ? <p key={i}>{line}</p> : <br key={i} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-lg bg-secondary/50 w-fit animate-fade-in">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">AI is thinking deeply...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-gradient-to-t from-card/80 to-transparent backdrop-blur-sm">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me to create files, debug code, or explain concepts..."
            className="min-h-[80px] bg-input/90 border-border/50 resize-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-[80px] w-[80px] bg-gradient-to-br from-primary via-primary-glow to-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
