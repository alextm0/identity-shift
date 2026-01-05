"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { updateWinsAction } from "@/actions/yearly-reviews";
import { Textarea } from "@/components/ui/textarea";
import { useEditableSection } from "@/hooks/use-editable-section";

interface EditableWinsSectionProps {
    reviewId: string;
    initialWins: string[];
}

export function EditableWinsSection({
    reviewId,
    initialWins,
}: EditableWinsSectionProps) {
    const {
        isEditing,
        setIsEditing,
        isSaving,
        value: wins,
        setValue: setWins,
        handleSave,
        handleCancel
    } = useEditableSection({
        initialValue: initialWins || [],
        onSave: async (val) => {
            const filteredWins = val.filter(w => w.trim() !== "");
            return updateWinsAction(reviewId, filteredWins);
        },
        successMessage: "Wins updated",
        errorMessage: "Failed to update wins"
    });

    const addWin = () => {
        setWins([...wins, ""]);
    };

    const removeWin = (index: number) => {
        const newWins = [...wins];
        newWins.splice(index, 1);
        setWins(newWins);
    };

    const updateWin = (index: number, val: string) => {
        const newWins = [...wins];
        newWins[index] = val;
        setWins(newWins);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                    Wins
                </h2>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                                className="font-mono text-[10px] h-7 uppercase tracking-widest"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                variant="violet"
                                size="sm"
                                className="font-mono text-[10px] h-7 uppercase tracking-widest"
                            >
                                <Save className="h-3 w-3 mr-1" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="ghost"
                            size="sm"
                            className="font-mono text-[10px] h-7 uppercase tracking-widest text-white/40 hover:text-white"
                        >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit Wins
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {wins.map((win, i) => (
                            <div key={i} className="flex gap-3 group">
                                <div className="mt-2.5 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <span className="text-white/40 text-[10px] font-mono">{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <Textarea
                                        value={win}
                                        onChange={(e) => updateWin(i, e.target.value)}
                                        placeholder="What did you achieve?"
                                        rows={2}
                                        className="bg-white/5 border-white/10 text-white min-h-[60px] resize-none focus:border-action-emerald/50"
                                    />
                                </div>
                                <Button
                                    onClick={() => removeWin(i)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/20 hover:text-bullshit-crimson h-10 w-10 shrink-0 self-center"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={addWin}
                        variant="outline"
                        className="w-full border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/20 font-mono text-xs uppercase tracking-widest"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Win
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wins.length > 0 ? (
                        wins.map((win, i) => (
                            <div key={i} className="glass-pane p-6 relative group border-white/[0.05] hover:border-white/10 transition-all">
                                <div className="absolute top-4 right-4 flex-shrink-0 w-6 h-6 rounded-full bg-action-emerald/10 border border-action-emerald/20 flex items-center justify-center">
                                    <span className="text-action-emerald text-[10px] font-mono">{i + 1}</span>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed pr-6">{win}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-white/20 font-mono text-xs uppercase tracking-widest border border-dashed border-white/5 rounded-lg">
                            No wins recorded
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
