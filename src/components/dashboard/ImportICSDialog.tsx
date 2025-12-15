import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParsedEvent {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface ImportICSDialogProps {
  onImport: (events: ParsedEvent[]) => Promise<void>;
}

// Parse ICS file content
function parseICS(content: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = content.split(/\r?\n/);
  
  let currentEvent: Partial<ParsedEvent> | null = null;
  let currentKey = '';
  let currentValue = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle line folding (lines starting with space/tab are continuations)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].substring(1);
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.title && currentEvent.start_time && currentEvent.end_time) {
        events.push({
          title: currentEvent.title,
          description: currentEvent.description || '',
          start_time: currentEvent.start_time,
          end_time: currentEvent.end_time,
          location: currentEvent.location || '',
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const keyPart = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        const key = keyPart.split(';')[0]; // Remove parameters like TZID

        switch (key) {
          case 'SUMMARY':
            currentEvent.title = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            break;
          case 'DESCRIPTION':
            currentEvent.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            break;
          case 'LOCATION':
            currentEvent.location = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            break;
          case 'DTSTART':
            currentEvent.start_time = parseICSDate(value);
            break;
          case 'DTEND':
            currentEvent.end_time = parseICSDate(value);
            break;
        }
      }
    }
  }

  return events;
}

// Parse ICS date format to ISO string
function parseICSDate(dateStr: string): string {
  // Handle different date formats
  // Format: YYYYMMDD or YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const cleanDate = dateStr.replace(/[TZ]/g, (match) => match === 'T' ? 'T' : '');
  
  if (dateStr.length === 8) {
    // All-day event: YYYYMMDD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00`).toISOString();
  } else {
    // Date with time: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
    const datePart = dateStr.substring(0, 8);
    const timePart = dateStr.substring(9, 15);
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    const hour = timePart.substring(0, 2);
    const minute = timePart.substring(2, 4);
    const second = timePart.substring(4, 6);
    
    const isUTC = dateStr.endsWith('Z');
    const dateString = `${year}-${month}-${day}T${hour}:${minute}:${second}${isUTC ? 'Z' : ''}`;
    return new Date(dateString).toISOString();
  }
}

interface FileWithEvents {
  file: File;
  events: ParsedEvent[];
  status: 'pending' | 'importing' | 'done' | 'error';
}

export function ImportICSDialog({ onImport }: ImportICSDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithEvents[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    const newFiles: FileWithEvents[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name.endsWith('.ics')) {
        const content = await file.text();
        const events = parseICS(content);
        newFiles.push({ file, events, status: 'pending' });
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'importing' } : f
      ));
      
      try {
        await onImport(files[i].events);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'done' } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' } : f
        ));
      }
    }
    
    setIsImporting(false);
    setTimeout(() => {
      setOpen(false);
      setFiles([]);
    }, 1000);
  };

  const totalEvents = files.reduce((acc, f) => acc + f.events.length, 0);
  const pendingFiles = files.filter(f => f.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import ICS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Import Calendar Files
          </DialogTitle>
          <DialogDescription>
            Upload .ics files from Google Calendar, Outlook, or other apps.
          </DialogDescription>
        </DialogHeader>
        
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          )}
        >
          <Upload className={cn(
            "h-10 w-10 mx-auto mb-3 transition-colors",
            dragActive ? "text-primary" : "text-muted-foreground"
          )} />
          <p className="text-sm font-medium text-foreground">
            Drop ICS files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports multiple files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fileData.events.length} events found
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {fileData.status === 'importing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {fileData.status === 'done' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {fileData.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleImport}
            disabled={files.length === 0 || isImporting || pendingFiles === 0}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Import {totalEvents} Events
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
