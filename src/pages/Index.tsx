import { useState, useEffect } from 'react';
import { Chat } from '@/components/Chat';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPane } from '@/components/PreviewPane';
import { FileExplorer } from '@/components/FileExplorer';
import { Code2, Sparkles, FileCode, Globe, MessageSquare } from 'lucide-react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  
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

  // Auto-run and generate preview whenever files change
  useEffect(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js'));

    if (htmlFile) {
      let html = htmlFile.content;
      
      // Inject CSS
      if (cssFiles.length > 0) {
        const cssContent = cssFiles.map(f => f.content).join('\n');
        html = html.replace('</head>', `<style>${cssContent}</style></head>`);
      }
      
      // Inject JS with console capture
      if (jsFiles.length > 0) {
        const jsContent = jsFiles.map(f => f.content).join('\n');
        const wrappedJs = `
          <script>
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
              logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' '));
              originalLog(...args);
              window.parent.postMessage({ type: 'console', logs }, '*');
            };
            
            try {
              ${jsContent}
            } catch (error) {
              console.log('Error: ' + error.message);
            }
          </script>
        `;
        html = html.replace('</body>', `${wrappedJs}</body>`);
      }
      
      setPreviewHtml(html);
    } else if (jsFiles.length > 0) {
      // Run pure JS files
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog(...args);
      };

      try {
        jsFiles.forEach(f => eval(f.content));
        setOutput(logs.length > 0 ? logs : ['Code executed successfully']);
      } catch (error: any) {
        setOutput([`Error: ${error.message}`]);
      }
      
      console.log = originalLog;
    }
  }, [files]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setOutput(event.data.logs);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
        <div className="w-[250px] flex-shrink-0 border-r border-border/50">
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onCreateFile={(name) => createFile(name)}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
          />
        </div>

        {/* Main Workspace with Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-secondary/30 h-12 px-4">
              <TabsTrigger value="editor" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FileCode className="w-4 h-4" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Globe className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="w-4 h-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 m-0">
              <CodeEditor 
                file={activeFile}
                onUpdateFile={(content) => {
                  if (activeFile) {
                    updateFile(activeFile.id, { content });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0">
              <PreviewPane htmlContent={previewHtml} consoleOutput={output} />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-0">
              <Chat 
                filesContext={getAllFilesContext()}
                onFileOperation={handleFileOperation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
