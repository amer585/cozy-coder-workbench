import { Textarea } from '@/components/ui/textarea';
import { Code, FileCode } from 'lucide-react';
import { FileItem } from '@/hooks/useFileSystem';

interface CodeEditorProps {
  file: FileItem | undefined;
  onUpdateFile: (content: string) => void;
}

export const CodeEditor = ({ file, onUpdateFile }: CodeEditorProps) => {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-[hsl(var(--editor-bg))] text-muted-foreground">
        <p>No file selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--editor-bg))]">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">{file.name}</h2>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Textarea
          value={file.content}
          onChange={(e) => onUpdateFile(e.target.value)}
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
        {file.language} • UTF-8
      </div>
    </div>
  );
};
