"""
Python Metrics Analyzer Service
FastAPI service that collects and analyzes system CPU and memory metrics.
"""

from collections import deque
from fastapi import FastAPI
from pydantic import BaseModel
import psutil

app = FastAPI(title="Metrics Analyzer", version="1.0.0")

# Rolling average storage - last 10 readings
cpu_readings: deque[float] = deque(maxlen=10)
memory_readings: deque[float] = deque(maxlen=10)


class MetricsResponse(BaseModel):
    cpu: float
    memory: float
    cpuStatus: str
    memoryStatus: str
    cpuAverage: float
    memoryAverage: float


class HealthResponse(BaseModel):
    status: str
    service: str


def classify_cpu_status(cpu_percent: float) -> str:
    """Classify CPU status based on thresholds."""
    if cpu_percent > 80:
        return "CRITICAL"
    elif cpu_percent >= 60:
        return "HIGH"
    return "NORMAL"


def classify_memory_status(memory_percent: float) -> str:
    """Classify memory status based on thresholds."""
    if memory_percent > 85:
        return "CRITICAL"
    elif memory_percent >= 70:
        return "HIGH"
    return "NORMAL"


def calculate_average(readings: deque[float]) -> float:
    """Calculate average of readings, return 0 if empty."""
    if not readings:
        return 0.0
    return round(sum(readings) / len(readings), 2)


@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics() -> MetricsResponse:
    """
    Return current CPU and memory stats with status classification.
    Maintains rolling average of last 10 readings.
    """
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory_percent = psutil.virtual_memory().percent

    # Store readings for rolling average
    cpu_readings.append(cpu_percent)
    memory_readings.append(memory_percent)

    return MetricsResponse(
        cpu=round(cpu_percent, 2),
        memory=round(memory_percent, 2),
        cpuStatus=classify_cpu_status(cpu_percent),
        memoryStatus=classify_memory_status(memory_percent),
        cpuAverage=calculate_average(cpu_readings),
        memoryAverage=calculate_average(memory_readings),
    )


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint for service status."""
    return HealthResponse(status="healthy", service="metrics-python")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
