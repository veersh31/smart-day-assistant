import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Plus, 
  Loader2, 
  Sparkles,
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

interface AddTaskDialogProps {
  onAdd: (task: {
    title: string;
    description: string;
    due_date: string | null;
    priority_level: string;
    category: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const categories = [
  { value: 'Work', icon: Briefcase, color: 'text-category-work' },
  { value: 'Personal', icon: User, color: 'text-category-personal' },
  { value: 'Health', icon: Heart, color: 'text-category-health' },
  { value: 'Finance', icon: DollarSign, color: 'text-category-finance' },
  { value: 'Learning', icon: BookOpen, color: 'text-category-learning' },
  { value: 'Errands', icon: ShoppingBag, color: 'text-category-errands' },
  { value: 'Creative', icon: Palette, color: 'text-category-creative' },
  { value: 'Social', icon: Users, color: 'text-category-social' },
];

export function AddTaskDialog({ onAdd, isLoading }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onAdd({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate ? dueDate.toISOString() : null,
      priority_level: priority,
      category,
    });
    setIsSubmitting(false);

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('medium');
    setCategory('Work');
    setOpen(false);
  };

  const selectedCategory = categories.find(c => c.value === category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2 shadow-glow">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Add New Task
            <Sparkles className="h-5 w-5 text-primary animate-pulse-subtle" />
          </DialogTitle>
          <DialogDescription>
            Create a task and let AI automatically prioritize it for you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Add more context for better AI prioritization..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-priority-low" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-priority-medium" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-priority-high" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-transparent bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isSelected ? cat.color : "text-muted-foreground")} />
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {cat.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
