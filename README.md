# Girl Math Stocks

Learn the stock market through girl math: track women-founded and women-led companies,
translate Wall Street jargon, and see what your iced coffee could become.

## Architecture

```
Browser ──► Next.js (client, :3000)
              ├─ app/page.tsx          Server Component, calls lib/data.ts directly
              └─ app/api/*             Backend-for-frontend route handlers
                    │  lib/data.ts  (shared data layer, mock fallback if a service is down)
                    ├──► server-node   (:5050)  dictionary, quotes, calculator presets
                    └──► server-spring (:8080)  stocks, practice portfolio
```

The browser only ever talks to Next.js. If Node or Spring isn't running, the UI falls back to
`client/lib/mock-data.ts`, so you can work on the frontend alone. In dev, a small footer line on the
dashboard shows which source each section came from.

## Run it

```bash
# 1. Node service
cd server-node && npm install && npm run dev        # http://localhost:5050

# 2. Spring service (needs Java 21+)
cd server-spring && ./mvnw spring-boot:run           # http://localhost:8080

# 3. Frontend
cd client && cp .env.example .env.local && npm run dev   # http://localhost:3000
```

Spring boots without Postgres (see `application.properties`); the portfolio is in-memory for now.

## API

| Next.js route (BFF)        | Proxies to                         | Notes                         |
| -------------------------- | ---------------------------------- | ----------------------------- |
| `GET /api/stocks`          | Spring `GET /api/stocks`           | `?sector=` supported on Spring |
| `GET /api/stocks/:ticker`  | Spring `GET /api/stocks/{ticker}`  | 404 if unknown                |
| `GET /api/portfolio`       | Spring `GET /api/portfolio`        | practice portfolio            |
| `POST /api/portfolio`      | Spring `POST /api/portfolio/holdings` | body `{ ticker, shares }`  |
| `GET /api/dictionary?q=`   | Node `GET /api/dictionary`         | `?tag=` supported on Node     |
| `GET /api/quote`           | Node `GET /api/girl-math-quote`    | random quote                  |
| `GET /api/scenarios`       | Node `GET /api/scenarios`          | calculator presets            |

## Before launch

- Prices are **demo data** (deterministic random walk). Plug in a market-data provider in
  `StockCatalog.java`.
- Company leadership lines are seed copy — re-verify them, since CEOs change.
- Practice portfolio is single-user and in-memory; move it to Postgres via JPA and add auth.
