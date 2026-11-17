package com.example.server_spring.stock;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Component;

/**
 * Curated list of women-founded / women-led public companies.
 *
 * Prices are DEMO data: a deterministic random walk seeded by ticker, so charts are stable.
 * Swap {@link #buildDemoStock} for a market-data provider (e.g. via a MarketDataClient) when ready.
 * Leadership copy is seed data and should be re-verified before launch, since CEOs change.
 */
@Component
public class StockCatalog {

    private record Seed(String ticker, String name, String sector, String herStory, String vibe, double basePrice) {
    }

    private static final List<Seed> SEEDS = List.of(
            new Seed("ULTA", "Ulta Beauty", "Beauty", "Led by CEO Kecia Steelman", "Your Saturday errand, but make it a holding.", 520),
            new Seed("EL", "Estée Lauder", "Beauty", "Co-founded by Estée Lauder in 1946", "The OG self-made beauty empire.", 78),
            new Seed("BMBL", "Bumble", "Dating", "Founded and led by Whitney Wolfe Herd", "Women make the first move. Including on the cap table.", 6),
            new Seed("REAL", "The RealReal", "Fashion", "Founded by Julie Wainwright", "Consignment, but it's a ticker.", 9),
            new Seed("RENT", "Rent the Runway", "Fashion", "Co-founded by Jennifer Hyman & Jennifer Fleiss", "Closet in the cloud.", 8),
            new Seed("SFIX", "Stitch Fix", "Fashion", "Founded by Katrina Lake", "A stylist in a box, IPO'd by a founder in her 30s.", 5),
            new Seed("AMD", "AMD", "Tech", "Led by CEO Dr. Lisa Su", "Chips. The silicon kind.", 240),
            new Seed("GM", "General Motors", "Auto", "Led by CEO Mary Barra", "Hot girl drives a hot stock.", 70),
            new Seed("ACN", "Accenture", "Services", "Led by CEO Julie Sweet", "The consultant who's always right.", 260),
            new Seed("PGR", "Progressive", "Insurance", "Led by CEO Tricia Griffith", "Boring is the new rich.", 245));

    private final Map<String, Stock> byTicker;

    public StockCatalog() {
        Map<String, Stock> map = new LinkedHashMap<>();
        for (Seed seed : SEEDS) {
            map.put(seed.ticker(), buildDemoStock(seed));
        }
        this.byTicker = Collections.unmodifiableMap(map);
    }

    public List<Stock> all() {
        return List.copyOf(byTicker.values());
    }

    public Optional<Stock> find(String ticker) {
        if (ticker == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(byTicker.get(ticker.toUpperCase()));
    }

    private static Stock buildDemoStock(Seed seed) {
        Random rand = new Random(seed.ticker().hashCode());
        List<Double> history = new ArrayList<>(30);
        double p = seed.basePrice();
        for (int i = 0; i < 30; i++) {
            p = p * (1 + (rand.nextDouble() - 0.48) * 0.04);
            history.add(round2(p));
        }
        double price = history.get(history.size() - 1);
        double prev = history.get(history.size() - 2);
        double changePct = round2((price - prev) / prev * 100);
        return new Stock(seed.ticker(), seed.name(), seed.sector(), seed.herStory(), seed.vibe(), price, changePct, List.copyOf(history));
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
