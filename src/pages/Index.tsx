import { useState } from 'react';
import { Chat } from '@/components/Chat';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPane } from '@/components/PreviewPane';
import { FileExplorer } from '@/components/FileExplorer';
import { Code2, Sparkles } from 'lucide-react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [output, setOutput] = useState<string[]>([]);
  const {
    files,
    activeFileId,
    setActiveFileId,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    getActiveFile,
    getAllFilesContext
  } = useFileSystem();

  const handleRunCode = (code: string) => {
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog(...args);
      };

      eval(code);
      console.log = originalLog;
      
      setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)']);
    } catch (error: any) {
      setOutput([`Error: ${error.message}`]);
    }
  };

  const handleFileOperation = (operation: string, fileName: string, content?: string) => {
    switch (operation) {
      case 'create':
        if (content !== undefined) {
          createFile(fileName, content);
          toast({
            title: "File Created",
            description: `${fileName} has been created by AI`,
          });
        }
        break;
      case 'edit':
        const existingFile = files.find(f => f.name === fileName);
        if (existingFile && content !== undefined) {
          updateFile(existingFile.id, { content });
          toast({
            title: "File Updated",
            description: `${fileName} has been updated by AI`,
          });
        }
        break;
      case 'delete':
        const fileToDelete = files.find(f => f.name === fileName);
        if (fileToDelete) {
          deleteFile(fileToDelete.id);
          toast({
            title: "File Deleted",
            description: `${fileName} has been deleted by AI`,
          });
        }
        break;
    }
  };

  const activeFile = getActiveFile();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-glow)] pointer-events-none" />
        <div className="relative flex items-center gap-3 z-10">
          <div className="relative">
            <Code2 className="w-8 h-8 text-primary" />
            <Sparkles className="w-4 h-4 text-primary-glow absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Code Studio
            </h1>
            <p className="text-xs text-muted-foreground">Powered by OpenRouter</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-[250px] flex-shrink-0">
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onCreateFile={(name) => createFile(name)}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
          />
        </div>

        {/* Chat Panel */}
        <div className="w-[350px] flex-shrink-0">
          <Chat 
            filesContext={getAllFilesContext()}
            onFileOperation={handleFileOperation}
          />
        </div>

        {/* Code Editor */}
        <div className="flex-1">
          <CodeEditor 
            file={activeFile}
            onRun={handleRunCode}
            onUpdateFile={(content) => {
              if (activeFile) {
                updateFile(activeFile.id, { content });
              }
            }}
          />
        </div>

        {/* Preview Panel */}
        <div className="w-[350px] flex-shrink-0">
          <PreviewPane output={output} />
        </div>
      </div>
    </div>
  );
};

export default Index;
