import { useState, useEffect } from 'react';

export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'ai-code-studio-files';

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default files
    return [
      {
        id: '1',
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
  });

  const [activeFileId, setActiveFileId] = useState<string>('1');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const createFile = (name: string, content: string = '', language: string = 'javascript') => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    return newFile;
  };

  const updateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, ...updates, updatedAt: Date.now() }
        : file
    ));
  };

  const deleteFile = (id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      if (activeFileId === id && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });
  };

  const renameFile = (id: string, newName: string) => {
    updateFile(id, { name: newName });
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
    getAllFilesContext
  };
};
