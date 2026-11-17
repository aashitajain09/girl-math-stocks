package com.example.server_spring.portfolio;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    public record AddHoldingRequest(String ticker, Double shares) {
    }

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    /** GET /api/portfolio */
    @GetMapping
    public PortfolioService.PortfolioView get() {
        return service.view();
    }

    /** POST /api/portfolio/holdings { "ticker": "ULTA", "shares": 1 } */
    @PostMapping("/holdings")
    public ResponseEntity<?> add(@RequestBody AddHoldingRequest req) {
        if (req == null || req.ticker() == null || req.ticker().isBlank()) {
            return badRequest("ticker is required.");
        }
        if (req.shares() == null || req.shares() <= 0 || req.shares() > 10_000) {
            return badRequest("shares must be a positive number.");
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.add(req.ticker(), req.shares()));
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    private static ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
