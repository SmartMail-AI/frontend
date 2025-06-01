import { Button } from '../components/ui/button';

interface CategoryListViewProps {
  categories: string[];
  setSelectedCategory: (category: string) => void;
  selectedCategory: string;
}

export default function CategoryListView({ categories, selectedCategory, setSelectedCategory }: CategoryListViewProps) {
  return categories.map((category) => {
    return (
      <div key={category}>
        <Button
          variant={selectedCategory === category ? "secondary" : "ghost"}
          className="w-full justify-start gap-3 h-10"
          onClick={() => {
            setSelectedCategory(category)
          }}
        >
          <span className="flex-1 text-left">{category}</span>
          {/*<Badge variant="secondary" className="text-xs">*/}
          {/*  {category.count}*/}
          {/*</Badge>*/}
          {/*<ChevronRight*/}
          {/*  className={`h-4 w-4 transition-transform ${isAiCategoryExpanded ? "rotate-90" : ""}`}*/}
          {/*/>*/}
        </Button>
      </div>
    )
  });
}
