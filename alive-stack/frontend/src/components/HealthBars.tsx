import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metrics {
  cpu: number;
  memory: number;
  cpuStatus: string;
  memoryStatus: string;
}

interface HealthBarsProps {
  metrics?: Metrics;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "CRITICAL":
      return "bg-red-500";
    case "HIGH":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case "CRITICAL":
      return "text-red-500";
    case "HIGH":
      return "text-yellow-500";
    default:
      return "text-green-500";
  }
}

function HealthBar({ value, status }: { value: number; status: string }) {
  return (
    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${getStatusColor(status)}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function HealthBars({ metrics }: HealthBarsProps) {
  const cpu = metrics?.cpu ?? 0;
  const memory = metrics?.memory ?? 0;
  const cpuStatus = metrics?.cpuStatus ?? "NORMAL";
  const memoryStatus = metrics?.memoryStatus ?? "NORMAL";

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">CPU Usage</span>
            <span className={`text-sm font-semibold ${getStatusTextColor(cpuStatus)}`}>
              {cpu.toFixed(1)}% ({cpuStatus})
            </span>
          </div>
          <HealthBar value={cpu} status={cpuStatus} />
        </div>

        {/* Memory Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Memory Usage</span>
            <span className={`text-sm font-semibold ${getStatusTextColor(memoryStatus)}`}>
              {memory.toFixed(1)}% ({memoryStatus})
            </span>
          </div>
          <HealthBar value={memory} status={memoryStatus} />
        </div>
      </CardContent>
    </Card>
  );
}
