"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportUserDataAction } from "@/actions/export";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExportDataButton() {
    const [isExporting, setIsExporting] = useState(false);

    async function handleExport() {
        setIsExporting(true);
        try {
            const data = await exportUserDataAction();
            
            // Create a blob and download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `identity-shifter-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success("Data exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to export data");
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-action-emerald/20 border border-action-emerald/30 text-action-emerald hover:bg-action-emerald/30 font-mono text-xs uppercase tracking-widest"
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                </>
            )}
        </Button>
    );
}

