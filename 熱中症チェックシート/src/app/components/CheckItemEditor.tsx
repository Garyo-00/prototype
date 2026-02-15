import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export type ResponseType = "free_text" | "single_choice" | "temperature" | "numeric";

export interface NormalValueConfig {
  type: "single_choice" | "range";
  selectedOption?: string; // For single_choice
  min?: number; // For temperature/numeric
  max?: number; // For temperature/numeric
}

export interface CheckItem {
  id: string;
  name: string;
  responseType: ResponseType;
  options?: string[]; // For single_choice
  normalValue?: NormalValueConfig;
}

interface CheckItemEditorProps {
  item: CheckItem;
  onUpdate: (item: CheckItem) => void;
  onDelete: () => void;
}

export function CheckItemEditor({ item, onUpdate, onDelete }: CheckItemEditorProps) {
  const [newOption, setNewOption] = useState("");

  const handleNameChange = (name: string) => {
    onUpdate({ ...item, name });
  };

  const handleResponseTypeChange = (responseType: ResponseType) => {
    const updatedItem: CheckItem = { ...item, responseType };
    
    // Reset options and normal value when changing response type
    if (responseType === "single_choice") {
      updatedItem.options = [""];
      updatedItem.normalValue = { type: "single_choice" };
    } else if (responseType === "temperature" || responseType === "numeric") {
      updatedItem.options = undefined;
      updatedItem.normalValue = { type: "range", min: undefined, max: undefined };
    } else {
      updatedItem.options = undefined;
      updatedItem.normalValue = undefined;
    }
    
    onUpdate(updatedItem);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const options = [...(item.options || []), newOption.trim()];
      onUpdate({ ...item, options });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    const options = (item.options || []).filter((_, i) => i !== index);
    onUpdate({ ...item, options });
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(item.options || [])];
    options[index] = value;
    onUpdate({ ...item, options });
  };

  const handleNormalValueSelection = (selectedOption: string) => {
    onUpdate({
      ...item,
      normalValue: { type: "single_choice", selectedOption },
    });
  };

  const handleRangeChange = (field: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onUpdate({
      ...item,
      normalValue: {
        type: "range",
        ...item.normalValue,
        [field]: numValue,
      },
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          {/* 項目名 */}
          <div>
            <Label htmlFor={`item-name-${item.id}`}>項目名</Label>
            <Input
              id={`item-name-${item.id}`}
              value={item.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="項目名を入力"
            />
          </div>

          {/* 回答方法 */}
          <div>
            <Label htmlFor={`response-type-${item.id}`}>回答方法</Label>
            <Select value={item.responseType} onValueChange={(value) => handleResponseTypeChange(value as ResponseType)}>
              <SelectTrigger id={`response-type-${item.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free_text">自由記述</SelectItem>
                <SelectItem value="single_choice">選択式（単数）</SelectItem>
                <SelectItem value="temperature">選択式（体温）</SelectItem>
                <SelectItem value="numeric">選択式（数値）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 選択式（単数）の場合の選択肢設定 */}
          {item.responseType === "single_choice" && (
            <div className="space-y-2">
              <Label>選択肢</Label>
              <div className="space-y-2">
                {item.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`選択肢${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="新しい選択肢"
                  onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                />
                <Button type="button" onClick={handleAddOption}>追加</Button>
              </div>
            </div>
          )}

          {/* 正常値設定 */}
          {item.responseType === "single_choice" && item.options && item.options.length > 0 && (
            <div className="space-y-2">
              <Label>正常値</Label>
              <RadioGroup
                value={item.normalValue?.selectedOption || ""}
                onValueChange={handleNormalValueSelection}
              >
                {item.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`normal-${item.id}-${index}`} />
                    <Label htmlFor={`normal-${item.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {(item.responseType === "temperature" || item.responseType === "numeric") && (
            <div className="space-y-2">
              <Label>正常値範囲</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`min-${item.id}`} className="text-sm text-gray-600">
                    {item.responseType === "temperature" ? "最低体温（℃）" : "最小値"}
                  </Label>
                  <Input
                    id={`min-${item.id}`}
                    type="number"
                    step={item.responseType === "temperature" ? "0.1" : "1"}
                    min={item.responseType === "temperature" ? "35.0" : "0"}
                    max={item.responseType === "temperature" ? "41.0" : "100"}
                    value={item.normalValue?.min ?? ""}
                    onChange={(e) => handleRangeChange("min", e.target.value)}
                    placeholder="以上"
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${item.id}`} className="text-sm text-gray-600">
                    {item.responseType === "temperature" ? "最高体温（℃）" : "最大値"}
                  </Label>
                  <Input
                    id={`max-${item.id}`}
                    type="number"
                    step={item.responseType === "temperature" ? "0.1" : "1"}
                    min={item.responseType === "temperature" ? "35.0" : "0"}
                    max={item.responseType === "temperature" ? "41.0" : "100"}
                    value={item.normalValue?.max ?? ""}
                    onChange={(e) => handleRangeChange("max", e.target.value)}
                    placeholder="以下"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 削除ボタン */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="size-5 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
