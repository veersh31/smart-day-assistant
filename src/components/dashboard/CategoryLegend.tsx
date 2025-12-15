import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORY_COLORS } from '@/lib/category-colors';
import { cn } from '@/lib/utils';

export function CategoryLegend() {
  const categories = Object.entries(CATEGORY_COLORS).filter(
    ([key]) => key !== 'Default'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Task Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {categories.map(([category, colors]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.dotColor }}
              />
              <span className="text-xs text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Events</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
