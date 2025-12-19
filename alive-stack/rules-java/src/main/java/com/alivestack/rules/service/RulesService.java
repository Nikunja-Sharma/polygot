package com.alivestack.rules.service;

import com.alivestack.rules.model.MetricsRequest;
import com.alivestack.rules.model.MoodResponse;
import org.springframework.stereotype.Service;

@Service
public class RulesService {

    public MoodResponse evaluateMood(MetricsRequest metrics) {
        // Priority 1: Any service offline → SICK
        if (metrics.getServiceHealth() != null && metrics.getServiceHealth().getOffline() > 0) {
            return new MoodResponse("SICK", "🤒", "One or more services are offline!", 4);
        }

        // Priority 2: CPU > 90% → ANGRY
        if (metrics.getCpu() > 90) {
            return new MoodResponse("ANGRY", "😠", "CPU usage is critically high!", 3);
        }

        // Priority 3: Error rate > 10% → SAD
        if (metrics.getErrorRate() > 10) {
            return new MoodResponse("SAD", "😢", "Error rate is too high!", 3);
        }

        // Priority 4: Memory > 85% → WORRIED
        if (metrics.getMemory() > 85) {
            return new MoodResponse("WORRIED", "😰", "Memory usage is concerning!", 2);
        }

        // Priority 5: Any service slow/degraded → NEUTRAL
        if (metrics.getServiceHealth() != null && metrics.getServiceHealth().getDegraded() > 0) {
            return new MoodResponse("NEUTRAL", "😐", "Some services are running slow.", 1);
        }

        // Priority 6: All normal → HAPPY
        return new MoodResponse("HAPPY", "😄", "All systems operational!", 0);
    }
}
