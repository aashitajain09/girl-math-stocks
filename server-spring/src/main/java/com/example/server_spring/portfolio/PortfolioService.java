package com.example.server_spring.portfolio;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.server_spring.stock.Stock;
import com.example.server_spring.stock.StockCatalog;

/**
 * Practice (simulated) portfolio. In-memory for now — a single demo user, reset on restart.
 * Next step: back this with a JPA entity + repository on Postgres, keyed by user id.
 */
@Service
public class PortfolioService {

    public record Holding(String ticker, double shares, double avgCost) {
    }

    public record Position(String ticker, double shares, double avgCost, String name, double price,
            double value, double gain, double gainPct) {
    }

    public record PortfolioView(List<Position> positions, double totalValue, double totalGain) {
    }

    private final StockCatalog catalog;
    private final Map<String, Holding> holdings = new LinkedHashMap<>();

    public PortfolioService(StockCatalog catalog) {
        this.catalog = catalog;
        holdings.put("ULTA", new Holding("ULTA", 1, 480));
        holdings.put("BMBL", new Holding("BMBL", 10, 7.2));
    }

    public synchronized PortfolioView view() {
        List<Position> positions = new ArrayList<>();
        for (Holding h : holdings.values()) {
            catalog.find(h.ticker()).ifPresent(s -> positions.add(price(h, s)));
        }
        double totalValue = positions.stream().mapToDouble(Position::value).sum();
        double totalGain = positions.stream().mapToDouble(Position::gain).sum();
        return new PortfolioView(positions, totalValue, totalGain);
    }

    /** Adds shares at the current (demo) price, averaging the cost basis. */
    public synchronized PortfolioView add(String ticker, double shares) {
        Stock stock = catalog.find(ticker)
                .orElseThrow(() -> new IllegalArgumentException("Unknown ticker: " + ticker));
        holdings.merge(stock.ticker(), new Holding(stock.ticker(), shares, stock.price()), (old, add) -> {
            double total = old.shares() + add.shares();
            double avg = (old.avgCost() * old.shares() + add.avgCost() * add.shares()) / total;
            return new Holding(old.ticker(), total, avg);
        });
        return view();
    }

    /**
     * Sells shares (simulated). {@code shares == null} sells the whole position.
     * Cost basis per share is unchanged by a sale; the position is removed when it hits zero.
     */
    public synchronized PortfolioView sell(String ticker, Double shares) {
        String key = ticker.toUpperCase();
        Holding h = holdings.get(key);
        if (h == null) {
            throw new IllegalArgumentException("You don't own any " + key + " to sell.");
        }
        if (shares != null && shares > h.shares() + 1e-9) {
            throw new IllegalArgumentException("You only own " + fmt(h.shares()) + " " + key + ".");
        }
        double left = shares == null ? 0 : h.shares() - shares;
        if (left <= 1e-9) {
            holdings.remove(key);
        } else {
            holdings.put(key, new Holding(key, left, h.avgCost()));
        }
        return view();
    }

    private static String fmt(double v) {
        return v == Math.rint(v) ? String.valueOf((long) v) : String.valueOf(v);
    }

    private static Position price(Holding h, Stock s) {
        double value = s.price() * h.shares();
        double cost = h.avgCost() * h.shares();
        double gain = value - cost;
        double gainPct = cost == 0 ? 0 : gain / cost * 100;
        return new Position(h.ticker(), h.shares(), h.avgCost(), s.name(), s.price(), value, gain, gainPct);
    }
}
