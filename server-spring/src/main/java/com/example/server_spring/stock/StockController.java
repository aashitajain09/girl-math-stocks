package com.example.server_spring.stock;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    public record StocksResponse(List<Stock> stocks, boolean demo, String asOf) {
    }

    private final StockCatalog catalog;

    public StockController(StockCatalog catalog) {
        this.catalog = catalog;
    }

    /** GET /api/stocks?sector=Beauty */
    @GetMapping
    public StocksResponse list(@RequestParam(required = false) String sector) {
        List<Stock> stocks = catalog.all();
        if (sector != null && !sector.isBlank()) {
            stocks = stocks.stream().filter(s -> s.sector().equalsIgnoreCase(sector)).toList();
        }
        return new StocksResponse(stocks, true, Instant.now().toString());
    }

    /** GET /api/stocks/{ticker} */
    @GetMapping("/{ticker}")
    public ResponseEntity<?> get(@PathVariable String ticker) {
        return catalog.find(ticker)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "We couldn't find " + ticker.toUpperCase() + " in the Sisterhood (yet).")));
    }
}
