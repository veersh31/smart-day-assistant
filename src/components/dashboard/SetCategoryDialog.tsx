import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CATEGORY_COLORS, type TaskCategory } from '@/lib/category-colors';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  User,
  Heart,
  DollarSign,
  BookOpen,
  ShoppingBag,
  Palette,
  Users,
  Check
} from 'lucide-react';

const categoryIcons = {
  Work: Briefcase,
  Personal: User,
  Health: Heart,
  Finance: DollarSign,
  Learning: BookOpen,
  Errands: ShoppingBag,
  Creative: Palette,
  Social: Users,
};

interface SetCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export function SetCategoryDialog({
  open,
  onOpenChange,
  currentCategory,
  onCategorySelect
}: SetCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory);

  const categories = Object.entries(CATEGORY_COLORS).filter(
    ([key]) => key !== 'Default'
  ) as [TaskCategory, typeof CATEGORY_COLORS[TaskCategory]][];

  const handleSelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Category</DialogTitle>
          <DialogDescription>
            Choose a category to organize and color-code this item
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {categories.map(([category, colors]) => {
            const Icon = categoryIcons[category];
            const isSelected = selectedCategory === category;

            return (
              <Button
                key={category}
                variant="outline"
                className={cn(
                  "h-auto flex-col gap-2 p-4 relative transition-all",
                  colors.hover,
                  isSelected && `${colors.bg} ${colors.border} border-2`
                )}
                onClick={() => handleSelect(category)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.dotColor + '20' }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: colors.dotColor }}
                  />
                </div>
                <span className="text-sm font-medium">{category}</span>
              </Button>
            );
          })}
        </div>

        {selectedCategory && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setSelectedCategory(null);
              onCategorySelect('');
              onOpenChange(false);
            }}
          >
            Remove Category
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
