package com.alivestack.rules.model;

public class MoodResponse {
    private String mood;
    private String emoji;
    private String reason;
    private int severity;

    public MoodResponse(String mood, String emoji, String reason, int severity) {
        this.mood = mood;
        this.emoji = emoji;
        this.reason = reason;
        this.severity = severity;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
    }
}
