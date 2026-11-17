package com.example.server_spring.stock;

import java.util.List;

/**
 * A company in the Sisterhood Portfolio, with a demo price history.
 * Field names match the client's TypeScript `Stock` type.
 */
public record Stock(
        String ticker,
        String name,
        String sector,
        String herStory,
        String vibe,
        double price,
        double changePct,
        List<Double> history) {
}
