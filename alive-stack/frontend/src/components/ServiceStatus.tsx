import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceHealth {
  status: "healthy" | "slow" | "offline";
  latency: number;
}

interface Services {
  python: ServiceHealth;
  rust: ServiceHealth;
  go: ServiceHealth;
  cpp: ServiceHealth;
  java: ServiceHealth;
}

interface ServiceStatusProps {
  services?: Services;
}

const serviceLabels: Record<string, { name: string; icon: string }> = {
  python: { name: "Python Metrics", icon: "🐍" },
  rust: { name: "Rust Validator", icon: "🦀" },
  go: { name: "Go Load Sim", icon: "🐹" },
  cpp: { name: "C++ Chaos", icon: "⚡" },
  java: { name: "Java Rules", icon: "☕" },
};

function getStatusBadge(status: string) {
  switch (status) {
    case "healthy":
      return <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>;
    case "slow":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Slow</Badge>;
    case "offline":
      return <Badge className="bg-red-500 hover:bg-red-600">Offline</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export function ServiceStatus({ services }: ServiceStatusProps) {
  const defaultServices: Services = {
    python: { status: "offline", latency: 0 },
    rust: { status: "offline", latency: 0 },
    go: { status: "offline", latency: 0 },
    cpp: { status: "offline", latency: 0 },
    java: { status: "offline", latency: 0 },
  };

  const serviceData = services || defaultServices;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(Object.keys(serviceLabels) as Array<keyof Services>).map((key) => {
            const label = serviceLabels[key];
            const health = serviceData[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{label.icon}</span>
                  <span className="font-medium">{label.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {health.latency}ms
                  </span>
                  {getStatusBadge(health.status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
