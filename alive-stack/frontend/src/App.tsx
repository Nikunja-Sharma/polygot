import { useEffect, useState } from "react";
import { Pet } from "@/components/Pet";
import { HealthBars } from "@/components/HealthBars";
import { ServiceStatus } from "@/components/ServiceStatus";
import { ControlPanel } from "@/components/ControlPanel";

interface PetStatus {
  mood: string;
  message: string;
  emoji: string;
}

interface Metrics {
  cpu: number;
  memory: number;
  cpuStatus: string;
  memoryStatus: string;
}

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

interface LoadStatus {
  active: boolean;
  rps: number;
}

interface StatusResponse {
  pet: PetStatus;
  metrics: Metrics;
  services: Services;
  load: LoadStatus;
}

export function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (!response.ok) throw new Error("Failed to fetch status");
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Poll /api/status every 3 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading AliveStack...</div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground">🐾 AliveStack</h1>
          <p className="text-muted-foreground">Your Polyglot Pet Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pet Display */}
          <Pet pet={status?.pet} />

          {/* Health Bars */}
          <HealthBars metrics={status?.metrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Status */}
          <ServiceStatus services={status?.services} />

          {/* Control Panel */}
          <ControlPanel load={status?.load} onRefresh={fetchStatus} />
        </div>
      </div>
    </div>
  );
}

export default App;
