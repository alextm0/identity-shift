"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
}

export function ItemList<T>({
  items,
  renderItem,
  emptyMessage = "No items",
  className,
  itemClassName,
}: ItemListProps<T>) {
  if (items.length === 0) {
    return (
      <div className={cn("p-12 text-center rounded-3xl border border-dashed border-white/5 bg-white/[0.01]", className)}>
        <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

