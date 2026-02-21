"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "table" | "cards";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border p-1">
      <Button
        variant={mode === "table" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onChange("table")}
        aria-label="Table view"
      >
        <List className="size-4" />
      </Button>
      <Button
        variant={mode === "cards" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onChange("cards")}
        aria-label="Card view"
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}
