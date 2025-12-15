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
  Trash2,
  Briefcase,
  User,
  Heart,
  DollarSign,
  BookOpen,
  ShoppingBag,
  Palette,
  Users
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

const priorityConfig = {
  high: { 
    bg: 'bg-priority-high/10', 
    text: 'text-priority-high', 
    border: 'border-priority-high/30',
    dot: 'bg-priority-high'
  },
  medium: { 
    bg: 'bg-priority-medium/10', 
    text: 'text-priority-medium', 
    border: 'border-priority-medium/30',
    dot: 'bg-priority-medium'
  },
  low: { 
    bg: 'bg-priority-low/10', 
    text: 'text-priority-low', 
    border: 'border-priority-low/30',
    dot: 'bg-priority-low'
  },
};

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Work: { icon: Briefcase, color: 'text-category-work', bg: 'bg-category-work/10' },
  Personal: { icon: User, color: 'text-category-personal', bg: 'bg-category-personal/10' },
  Health: { icon: Heart, color: 'text-category-health', bg: 'bg-category-health/10' },
  Finance: { icon: DollarSign, color: 'text-category-finance', bg: 'bg-category-finance/10' },
  Learning: { icon: BookOpen, color: 'text-category-learning', bg: 'bg-category-learning/10' },
  Errands: { icon: ShoppingBag, color: 'text-category-errands', bg: 'bg-category-errands/10' },
  Creative: { icon: Palette, color: 'text-category-creative', bg: 'bg-category-creative/10' },
  Social: { icon: Users, color: 'text-category-social', bg: 'bg-category-social/10' },
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const priority = (task.priority_level as 'high' | 'medium' | 'low') || 'medium';
  const priorityStyle = priorityConfig[priority];
  const category = task.category && categoryConfig[task.category];
  const CategoryIcon = category?.icon || Briefcase;

  return (
    <Card 
      className={cn(
        "group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 overflow-hidden",
        isCompleted ? "opacity-60 border-l-muted" : `border-l-priority-${priority}`,
        "relative"
      )}
    >
      {/* Priority indicator bar */}
      {!isCompleted && task.priority_score && task.priority_score >= 80 && (
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute top-2 -right-6 rotate-45 bg-priority-high text-priority-high-foreground text-[10px] font-bold py-0.5 px-6 shadow-sm">
            URGENT
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={(checked) => 
              onStatusChange(task.id, checked ? 'completed' : 'pending')
            }
            className={cn(
              "mt-1 transition-all duration-200",
              isCompleted && "data-[state=checked]:bg-success data-[state=checked]:border-success"
            )}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 
                className={cn(
                  "font-medium text-foreground leading-tight transition-all duration-200",
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
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-scale-in">
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                {task.description}
              </p>
            )}
            
            {task.ai_summary && (
              <div className="flex items-start gap-2 mt-3 p-2.5 rounded-lg bg-gradient-to-r from-primary/5 to-info/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse-subtle" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {task.ai_summary}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium",
                  priorityStyle.bg,
                  priorityStyle.text,
                  priorityStyle.border
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", priorityStyle.dot)} />
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
              
              {task.category && category && (
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs font-medium gap-1", category.bg, category.color)}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {task.category}
                </Badge>
              )}
              
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), 'MMM d')}
                </div>
              )}
              
              {task.priority_score !== null && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto font-mono">
                  <Clock className="h-3 w-3" />
                  {task.priority_score}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
