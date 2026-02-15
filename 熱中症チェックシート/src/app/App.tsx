import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Plus, Save } from "lucide-react";
import { CheckSheetPattern } from "./components/CheckSheetPattern";
import { CheckItem } from "./components/CheckItemEditor";
import { toast, Toaster } from "sonner";

interface Pattern {
  id: string;
  name: string;
  items: CheckItem[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createDefaultItems(count: number): CheckItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: "",
    responseType: "free_text" as const,
  }));
}

function App() {
  const [patterns, setPatterns] = useState<Pattern[]>([
    {
      id: generateId(),
      name: "パターン1",
      items: createDefaultItems(10),
    },
  ]);
  const [activeTab, setActiveTab] = useState("0");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("heatstroke-check-patterns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setPatterns(parsed);
        }
      } catch (error) {
        console.error("Failed to load saved patterns:", error);
      }
    }
  }, []);

  const handleAddPattern = () => {
    if (patterns.length >= 5) {
      toast.error("パターンは最大5つまでです");
      return;
    }

    const newPattern: Pattern = {
      id: generateId(),
      name: `パターン${patterns.length + 1}`,
      items: createDefaultItems(10),
    };

    setPatterns([...patterns, newPattern]);
    setActiveTab(String(patterns.length));
    toast.success("新しいパターンを追加しました");
  };

  const handleUpdateItem = (patternIndex: number, itemIndex: number, item: CheckItem) => {
    const newPatterns = [...patterns];
    newPatterns[patternIndex].items[itemIndex] = item;
    setPatterns(newPatterns);
  };

  const handleDeleteItem = (patternIndex: number, itemIndex: number) => {
    const newPatterns = [...patterns];
    newPatterns[patternIndex].items = newPatterns[patternIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setPatterns(newPatterns);
    toast.success("項目を削除しました");
  };

  const handleAddItem = (patternIndex: number) => {
    const newPatterns = [...patterns];
    newPatterns[patternIndex].items.push({
      id: generateId(),
      name: "",
      responseType: "free_text",
    });
    setPatterns(newPatterns);
    toast.success("項目を追加しました");
  };

  const handleSave = () => {
    try {
      localStorage.setItem("heatstroke-check-patterns", JSON.stringify(patterns));
      toast.success("保存しました");
    } catch (error) {
      console.error("Failed to save patterns:", error);
      toast.error("保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">熱中症チェックシート マスター作成</h1>
          <p className="text-gray-600">
            ここで設定した項目は、ユーザーがQRコードを読み込んでチェックを実施する際に表示される内容になります。
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center gap-2">
            <TabsList className="flex-1">
              {patterns.map((pattern, index) => (
                <TabsTrigger key={pattern.id} value={String(index)}>
                  {pattern.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {patterns.length < 5 && (
              <Button
                onClick={handleAddPattern}
                variant="outline"
                size="sm"
              >
                <Plus className="size-4 mr-1" />
                パターン追加
              </Button>
            )}
          </div>

          {patterns.map((pattern, patternIndex) => (
            <TabsContent key={pattern.id} value={String(patternIndex)} className="space-y-4">
              <CheckSheetPattern
                items={pattern.items}
                onUpdateItem={(itemIndex, item) =>
                  handleUpdateItem(patternIndex, itemIndex, item)
                }
                onDeleteItem={(itemIndex) => handleDeleteItem(patternIndex, itemIndex)}
                onAddItem={() => handleAddItem(patternIndex)}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSave} size="lg" className="min-w-48">
            <Save className="size-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
