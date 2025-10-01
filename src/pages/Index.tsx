import { useState } from 'react';
import { Chat } from '@/components/Chat';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPane } from '@/components/PreviewPane';
import { Code2, Sparkles } from 'lucide-react';

const Index = () => {
  const [output, setOutput] = useState<string[]>([]);

  const handleRunCode = (code: string) => {
    try {
      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog(...args);
      };

      // Execute code
      eval(code);
      
      // Restore console.log
      console.log = originalLog;
      
      setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)']);
    } catch (error) {
      setOutput([`Error: ${error.message}`]);
    }
  };

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
        {/* Chat Panel */}
        <div className="w-[400px] flex-shrink-0">
          <Chat />
        </div>

        {/* Code Editor */}
        <div className="flex-1">
          <CodeEditor onRun={handleRunCode} />
        </div>

        {/* Preview Panel */}
        <div className="w-[400px] flex-shrink-0">
          <PreviewPane output={output} />
        </div>
      </div>
    </div>
  );
};

export default Index;
