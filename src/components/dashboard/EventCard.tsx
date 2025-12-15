import { format, isToday, isTomorrow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  MoreHorizontal,
  Trash2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  priority_score: number | null;
  ai_summary: string | null;
  suggested_reply: string | null;
}

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  
  const getDateLabel = () => {
    if (isToday(startDate)) return 'Today';
    if (isTomorrow(startDate)) return 'Tomorrow';
    return format(startDate, 'EEE, MMM d');
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {getDateLabel()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </span>
            </div>
            
            <h3 className="font-medium text-foreground leading-tight">
              {event.title}
            </h3>
            
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
            
            {event.location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </div>
            )}
            
            {event.ai_summary && (
              <div className="flex items-start gap-2 mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {event.ai_summary}
                </p>
              </div>
            )}
            
            {event.suggested_reply && (
              <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-info" />
                  <span className="text-xs font-medium text-info">Suggested Reply</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.suggested_reply}
                </p>
              </div>
            )}
          </div>
          
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
                onClick={() => onDelete(event.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
