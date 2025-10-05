import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

const getDefaultFiles = (): FileItem[] => [
  {
    id: Date.now().toString(),
    name: 'main.js',
    content: `// Welcome to AI Code Studio!
// The AI can help you create, edit, and manage files

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`,
    language: 'javascript',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const useFileSystem = (conversationId?: string) => {
  const [files, setFiles] = useState<FileItem[]>(getDefaultFiles());
  const [activeFileId, setActiveFileId] = useState<string>(getDefaultFiles()[0].id);
  const [isLoading, setIsLoading] = useState(false);

  // Load files when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadFilesForConversation(conversationId);
    } else {
      setFiles(getDefaultFiles());
      setActiveFileId(getDefaultFiles()[0].id);
    }
  }, [conversationId]);

  const loadFilesForConversation = async (convId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_files')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedFiles: FileItem[] = data.map((file: any) => ({
          id: file.id,
          name: file.name,
          content: file.content,
          language: file.language,
          createdAt: new Date(file.created_at).getTime(),
          updatedAt: new Date(file.updated_at).getTime()
        }));
        setFiles(loadedFiles);
        setActiveFileId(loadedFiles[0].id);
      } else {
        const defaultFiles = getDefaultFiles();
        setFiles(defaultFiles);
        setActiveFileId(defaultFiles[0].id);

        // Save default files to database
        for (const file of defaultFiles) {
          await saveFileToDatabase(convId, file);
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files for this conversation",
        variant: "destructive"
      });
      const defaultFiles = getDefaultFiles();
      setFiles(defaultFiles);
      setActiveFileId(defaultFiles[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFileToDatabase = async (convId: string, file: FileItem) => {
    try {
      const { error } = await supabase
        .from('conversation_files')
        .upsert({
          id: file.id,
          conversation_id: convId,
          name: file.name,
          content: file.content,
          language: file.language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving file to database:', error);
      throw error;
    }
  };

  const createFile = async (name: string, content: string = '', language: string = 'javascript') => {
    const newFile: FileItem = {
      id: crypto.randomUUID(),
      name,
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);

    if (conversationId) {
      try {
        await saveFileToDatabase(conversationId, newFile);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save file to database",
          variant: "destructive"
        });
      }
    }

    return newFile;
  };

  const updateFile = async (id: string, updates: Partial<FileItem>) => {
    setFiles(prev => prev.map(file =>
      file.id === id
        ? { ...file, ...updates, updatedAt: Date.now() }
        : file
    ));

    if (conversationId) {
      const updatedFile = files.find(f => f.id === id);
      if (updatedFile) {
        try {
          await saveFileToDatabase(conversationId, {
            ...updatedFile,
            ...updates,
            updatedAt: Date.now()
          });
        } catch (error) {
          console.error('Error updating file in database:', error);
        }
      }
    }
  };

  const deleteFile = async (id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      if (activeFileId === id && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });

    if (conversationId) {
      try {
        const { error } = await supabase
          .from('conversation_files')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting file from database:', error);
        toast({
          title: "Error",
          description: "Failed to delete file from database",
          variant: "destructive"
        });
      }
    }
  };

  const renameFile = async (id: string, newName: string) => {
    await updateFile(id, { name: newName });
  };

  const getFile = (id: string) => files.find(f => f.id === id);

  const getActiveFile = () => files.find(f => f.id === activeFileId);

  const getAllFilesContext = () => {
    return files.map(f => `\n--- ${f.name} ---\n${f.content}`).join('\n\n');
  };

  return {
    files,
    activeFileId,
    setActiveFileId,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    getFile,
    getActiveFile,
    getAllFilesContext,
    isLoading
  };
};
