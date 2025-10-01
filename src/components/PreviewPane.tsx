import { useState } from 'react';
import { Terminal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewPaneProps {
  output: string[];
}

export const PreviewPane = ({ output }: PreviewPaneProps) => {
  return (
    <div className="flex flex-col h-full bg-[hsl(var(--editor-bg))] border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Console Output</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2 font-mono text-sm">
          {output.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Terminal className="w-12 h-12 mx-auto mb-4 text-primary/50" />
              <p className="text-sm">Run your code to see output here</p>
            </div>
          ) : (
            output.map((line, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-secondary/50 border border-border text-foreground"
              >
                <span className="text-muted-foreground mr-2">›</span>
                {line}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
