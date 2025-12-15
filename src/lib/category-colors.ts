/**
 * Category Color System for Tasks
 * Maps task categories to their respective colors for visual organization
 */

export const CATEGORY_COLORS = {
  Work: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    dotColor: '#3b82f6', // blue-500
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900',
  },
  Personal: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    dotColor: '#a855f7', // purple-500
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900',
  },
  Health: {
    bg: 'bg-green-100 dark:bg-green-950',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    dotColor: '#22c55e', // green-500
    hover: 'hover:bg-green-50 dark:hover:bg-green-900',
  },
  Finance: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-300',
    dotColor: '#10b981', // emerald-500
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900',
  },
  Learning: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    border: 'border-orange-300 dark:border-orange-700',
    text: 'text-orange-700 dark:text-orange-300',
    dotColor: '#f97316', // orange-500
    hover: 'hover:bg-orange-50 dark:hover:bg-orange-900',
  },
  Errands: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    border: 'border-yellow-300 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-300',
    dotColor: '#eab308', // yellow-500
    hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900',
  },
  Creative: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    border: 'border-pink-300 dark:border-pink-700',
    text: 'text-pink-700 dark:text-pink-300',
    dotColor: '#ec4899', // pink-500
    hover: 'hover:bg-pink-50 dark:hover:bg-pink-900',
  },
  Social: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    border: 'border-cyan-300 dark:border-cyan-700',
    text: 'text-cyan-700 dark:text-cyan-300',
    dotColor: '#06b6d4', // cyan-500
    hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900',
  },
  Default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    dotColor: '#6b7280', // gray-500
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  },
} as const;

export type TaskCategory = keyof typeof CATEGORY_COLORS;

export function getCategoryColor(category: string | null): typeof CATEGORY_COLORS[TaskCategory] {
  if (!category) return CATEGORY_COLORS.Default;

  // Check if category exists in our predefined categories
  if (category in CATEGORY_COLORS) {
    return CATEGORY_COLORS[category as TaskCategory];
  }

  return CATEGORY_COLORS.Default;
}

export function getCategoryBadge(category: string | null): string {
  return category || 'Uncategorized';
}
