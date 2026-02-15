import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { CheckItem, CheckItemEditor } from "./CheckItemEditor";

interface CheckSheetPatternProps {
  items: CheckItem[];
  onUpdateItem: (index: number, item: CheckItem) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
}

export function CheckSheetPattern({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: CheckSheetPatternProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => (
          <CheckItemEditor
            key={item.id}
            item={item}
            onUpdate={(updatedItem) => onUpdateItem(index, updatedItem)}
            onDelete={() => onDeleteItem(index)}
          />
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddItem}
        className="w-full"
      >
        <Plus className="size-4 mr-2" />
        項目を追加
      </Button>
    </div>
  );
}
