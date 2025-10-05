import { useState } from 'react';
import { FileItem } from '@/hooks/useFileSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  File, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FolderOpen,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CollapsibleFileExplorerProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

export const CollapsibleFileExplorer = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile
}: CollapsibleFileExplorerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCreate = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameFile(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const startRename = (file: FileItem) => {
    setEditingId(file.id);
    setEditName(file.name);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border/50 bg-[hsl(var(--editor-bg))] flex flex-col items-center py-4 gap-4">
        <Button
          onClick={() => setIsCollapsed(false)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          <ChevronRight className="w-4 h-4 text-primary" />
        </Button>
        <FolderOpen className="w-5 h-5 text-primary/50" />
      </div>
    );
  }

  return (
    <div className="w-[280px] flex flex-col h-full bg-[hsl(var(--editor-bg))] border-r border-border/50 transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCollapsed(true)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Files</h2>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isCreating && (
            <div className="flex items-center gap-1 p-2 bg-secondary/50 rounded-lg border border-border/50 animate-fade-in">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewFileName('');
                  }
                }}
                placeholder="filename.js"
                className="h-7 text-sm bg-input border-border/50"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-primary/20"
              >
                <Check className="w-3 h-3 text-primary" />
              </Button>
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setNewFileName('');
                }}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-destructive/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                activeFileId === file.id
                  ? 'bg-primary/20 border-primary/30 shadow-sm'
                  : 'hover:bg-secondary/50 border-transparent hover:border-border/50'
              }`}
            >
              {editingId === file.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file.id);
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditName('');
                      }
                    }}
                    className="h-7 text-sm flex-1 bg-input border-border/50"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleRename(file.id)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    <Check className="w-3 h-3 text-primary" />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditName('');
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <>
                  <File className="w-4 h-4 text-primary flex-shrink-0" />
                  <span
                    onClick={() => onSelectFile(file.id)}
                    className="flex-1 text-sm truncate font-medium"
                  >
                    {file.name}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(file);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-primary/20"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(file.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {files.length === 0 && !isCreating && (
            <div className="text-center text-muted-foreground py-8 text-sm">
              <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No files yet</p>
              <p className="text-xs mt-1">Click + to create one</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The file will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDeleteFile(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
