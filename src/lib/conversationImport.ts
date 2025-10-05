import { supabase } from '@/integrations/supabase/client';

export interface ExportedConversation {
  conversation: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  };
  messages: Array<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
  }>;
  files: Array<{
    id: string;
    conversation_id: string;
    name: string;
    content: string;
    language: string;
    created_at: string;
    updated_at: string;
  }>;
  exportedAt: string;
}

export const importConversation = async (
  exportData: ExportedConversation
): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    const { conversation, messages, files } = exportData;

    // Create new conversation
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: `${conversation.title} (imported)`
      })
      .select()
      .single();

    if (convError) throw convError;

    const newConvId = newConversation.id;

    // Import messages
    if (messages && messages.length > 0) {
      const messagesData = messages.map((msg) => ({
        conversation_id: newConvId,
        role: msg.role,
        content: msg.content
      }));

      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert(messagesData);

      if (msgError) throw msgError;
    }

    // Import files
    if (files && files.length > 0) {
      const filesData = files.map((file) => ({
        conversation_id: newConvId,
        name: file.name,
        content: file.content,
        language: file.language
      }));

      const { error: filesError } = await supabase
        .from('conversation_files')
        .insert(filesData);

      if (filesError) throw filesError;
    }

    return { success: true, conversationId: newConvId };
  } catch (error) {
    console.error('Error importing conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
