import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Code, FileCode } from 'lucide-react';

interface CodeEditorProps {
  onRun: (code: string) => void;
}

export const CodeEditor = ({ onRun }: CodeEditorProps) => {
  const [code, setCode] = useState(`// Write your code here
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--editor-bg))]">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Code Editor</h2>
        </div>
        <Button
          onClick={() => onRun(code)}
          size="sm"
          className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Code
        </Button>
      </div>

      <div className="flex-1 p-4">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full font-mono text-sm bg-input border-border resize-none"
          style={{
            lineHeight: '1.5',
            tabSize: 2
          }}
          spellCheck={false}
        />
      </div>

      <div className="px-4 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground flex items-center gap-2">
        <Code className="w-3 h-3" />
        JavaScript • UTF-8 • Ln 1, Col 1
      </div>
    </div>
  );
};
