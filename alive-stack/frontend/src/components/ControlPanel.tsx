import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LoadStatus {
  active: boolean;
  rps: number;
}

interface ControlPanelProps {
  load?: LoadStatus;
  onRefresh: () => void;
}

export function ControlPanel({ load, onRefresh }: ControlPanelProps) {
  const [cpuLoading, setCpuLoading] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);

  const triggerCpuChaos = async () => {
    setCpuLoading(true);
    try {
      await fetch("/api/chaos/cpu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_seconds: 10 }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to trigger CPU chaos:", err);
    } finally {
      setCpuLoading(false);
    }
  };

  const triggerMemoryChaos = async () => {
    setMemoryLoading(true);
    try {
      await fetch("/api/chaos/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ megabytes: 128, hold_seconds: 15 }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to trigger memory chaos:", err);
    } finally {
      setMemoryLoading(false);
    }
  };

  const toggleLoad = async () => {
    setLoadLoading(true);
    try {
      if (load?.active) {
        await fetch("/api/load/stop", { method: "POST" });
      } else {
        await fetch("/api/load/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rps: 10, target: "http://metrics:8000/metrics" }),
        });
      }
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle load:", err);
    } finally {
      setLoadLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Control Panel</span>
          {load?.active && (
            <Badge className="bg-blue-500">
              Load: {load.rps.toFixed(0)} RPS
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="destructive"
            onClick={triggerCpuChaos}
            disabled={cpuLoading}
            className="w-full"
          >
            {cpuLoading ? "Stressing..." : "🔥 Stress CPU"}
          </Button>
          <Button
            variant="destructive"
            onClick={triggerMemoryChaos}
            disabled={memoryLoading}
            className="w-full"
          >
            {memoryLoading ? "Allocating..." : "💾 Stress Memory"}
          </Button>
        </div>
        <Button
          variant={load?.active ? "secondary" : "default"}
          onClick={toggleLoad}
          disabled={loadLoading}
          className="w-full"
        >
          {loadLoading
            ? "Processing..."
            : load?.active
            ? "⏹️ Stop Load Test"
            : "▶️ Start Load Test"}
        </Button>
      </CardContent>
    </Card>
  );
}
