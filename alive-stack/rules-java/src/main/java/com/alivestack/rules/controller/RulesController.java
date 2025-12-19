package com.alivestack.rules.controller;

import com.alivestack.rules.model.MetricsRequest;
import com.alivestack.rules.model.MoodResponse;
import com.alivestack.rules.service.RulesService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class RulesController {

    private final RulesService rulesService;

    public RulesController(RulesService rulesService) {
        this.rulesService = rulesService;
    }

    @PostMapping("/rules/evaluate")
    public MoodResponse evaluateRules(@RequestBody MetricsRequest metrics) {
        return rulesService.evaluateMood(metrics);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy");
    }
}
