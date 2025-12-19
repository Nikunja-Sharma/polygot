package com.alivestack.rules.model;

public class MetricsRequest {
    private double cpu;
    private double memory;
    private double errorRate;
    private ServiceHealth serviceHealth;

    public double getCpu() {
        return cpu;
    }

    public void setCpu(double cpu) {
        this.cpu = cpu;
    }

    public double getMemory() {
        return memory;
    }

    public void setMemory(double memory) {
        this.memory = memory;
    }

    public double getErrorRate() {
        return errorRate;
    }

    public void setErrorRate(double errorRate) {
        this.errorRate = errorRate;
    }

    public ServiceHealth getServiceHealth() {
        return serviceHealth;
    }

    public void setServiceHealth(ServiceHealth serviceHealth) {
        this.serviceHealth = serviceHealth;
    }
}
