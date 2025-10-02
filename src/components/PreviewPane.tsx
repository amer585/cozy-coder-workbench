import { useEffect, useRef } from 'react';
import { Globe, Terminal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PreviewPaneProps {
  htmlContent: string;
  consoleOutput: string[];
}

export const PreviewPane = ({ htmlContent, consoleOutput }: PreviewPaneProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--editor-bg))] border-l border-border">
      <Tabs defaultValue="preview" className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="preview" className="gap-2">
              <Globe className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="console" className="gap-2">
              <Terminal className="w-4 h-4" />
              Console
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0">
          {htmlContent ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full bg-white"
              title="preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <Globe className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                <p className="text-sm">Create HTML files to see preview</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="console" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2 font-mono text-sm">
              {consoleOutput.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Terminal className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                  <p className="text-sm">Console output will appear here</p>
                </div>
              ) : (
                consoleOutput.map((line, idx) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
