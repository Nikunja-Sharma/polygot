package com.alivestack.rules.model;

public class ServiceHealth {
    private int healthy;
    private int degraded;
    private int offline;

    public int getHealthy() {
        return healthy;
    }

    public void setHealthy(int healthy) {
        this.healthy = healthy;
    }

    public int getDegraded() {
        return degraded;
    }

    public void setDegraded(int degraded) {
        this.degraded = degraded;
    }

    public int getOffline() {
        return offline;
    }

    public void setOffline(int offline) {
        this.offline = offline;
    }
}
