"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Item {
    id: string;
    text: string;
    // Allow extra properties for flexibility (e.g., category)
    [key: string]: any;
}

interface ItemListInputProps {
    items: Item[];
    onAdd: (text: string) => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, text: string) => void;
    placeholder?: string;
    addButtonText?: string;
    emptyStateMessage?: string;
    maxLength?: number;
    renderRightAction?: (item: Item) => React.ReactNode;
    renderCount?: boolean;
    requiredCount?: number;
    maxItems?: number; // Optional limit
}

export function ItemListInput({
    items,
    onAdd,
    onRemove,
    onUpdate,
    placeholder = "Add an item...",
    addButtonText = "Add",
    emptyStateMessage = "No items yet.",
    maxLength = 500,
    renderRightAction,
    renderCount = false,
    requiredCount,
    maxItems
}: ItemListInputProps) {
    const [newItemText, setNewItemText] = useState("");

    const handleAdd = () => {
        if (newItemText.trim()) {
            onAdd(newItemText.trim());
            setNewItemText("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    const filledCount = items.filter(i => i.text.trim().length > 0).length;
    const isRequiredMet = requiredCount ? filledCount >= requiredCount : true;

    return (
        <div className="space-y-6">
            {/* Header / Count info */}
            {(renderCount || requiredCount) && (
                <div className="flex justify-between items-center px-1">
                    {requiredCount && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                Progress
                            </span>
                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-focus-violet transition-all duration-300"
                                    style={{ width: `${Math.min(100, (filledCount / requiredCount) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <span className={cn(
                        "text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border",
                        isRequiredMet
                            ? "text-action-emerald border-action-emerald/20 bg-action-emerald/5"
                            : "text-white/40 border-white/10 bg-white/[0.02]"
                    )}>
                        {filledCount}{requiredCount ? `/${requiredCount}` : ' total'}
                    </span>
                </div>
            )}

            {/* Input Area - Clean & Simple */}
            {(!maxItems || items.length < maxItems) && (
                <div className="flex gap-2">
                    <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                        maxLength={maxLength}
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={!newItemText.trim()}
                        className="font-mono text-xs uppercase tracking-widest px-6 h-11"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {addButtonText}
                    </Button>
                </div>
            )}

            {/* List - Clearly defined items */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="group flex items-center gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors"
                        >
                            <span className="text-[10px] font-mono text-white/10 w-6 shrink-0 text-center">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            <div className="flex-1">
                                <textarea
                                    rows={1}
                                    value={item.text}
                                    onChange={(e) => {
                                        onUpdate(item.id, e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-white text-sm leading-relaxed resize-none overflow-hidden min-h-[36px] outline-none focus:border-focus-violet/30 focus:bg-white/[0.06] transition-all"
                                    placeholder="Enter content..."
                                    maxLength={maxLength}
                                    onFocus={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {renderRightAction && (
                                    <div className="shrink-0 scale-90">
                                        {renderRightAction(item)}
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(item.id)}
                                    className="h-8 w-8 text-white/20 hover:text-bullshit-crimson hover:bg-bullshit-crimson/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
                        <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">
                            {emptyStateMessage}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
