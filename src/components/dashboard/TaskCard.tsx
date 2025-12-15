import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Sparkles, 
  MoreHorizontal,
  Calendar,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority_score: number | null;
  priority_level: string | null;
  status: string | null;
  ai_summary: string | null;
  category: string | null;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
  low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const priority = (task.priority_level as 'high' | 'medium' | 'low') || 'medium';

  return (
    <Card 
      className={cn(
        "group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        isCompleted && "opacity-60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={(checked) => 
              onStatusChange(task.id, checked ? 'completed' : 'pending')
            }
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 
                className={cn(
                  "font-medium text-foreground leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            {task.ai_summary && (
              <div className="flex items-start gap-2 mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {task.ai_summary}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn("text-xs", priorityColors[priority])}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
              
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
              )}
              
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), 'MMM d')}
                </div>
              )}
              
              {task.priority_score && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3" />
                  Score: {task.priority_score}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
