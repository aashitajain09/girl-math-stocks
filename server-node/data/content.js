// Quotes and "Free Money" calculator presets.

const quotes = [
  { quote: "If I return a $50 top and buy a $50 stock, the stock was completely free.", category: "Portfolio growth" },
  { quote: "It's not a loss if I don't sell. It's a long-term relationship.", category: "Mindset" },
  { quote: "Cost-per-wear, but for shares: hold it 10 years and it basically paid me.", category: "Long game" },
  { quote: "A dividend is just the company saying thank you for shopping with us.", category: "Getting paid" },
  { quote: "I didn't buy high. I bought early for my future self.", category: "Mindset" },
  { quote: "If it's on sale, it's practically an investment. If it's a stock on sale, it literally is.", category: "Market moods" },
];

const scenarios = [
  { id: "iced-coffee", label: "Iced oat latte", emoji: "☕", amount: 6.5, perYear: 260, quip: "Every weekday. We don't judge, we calculate." },
  { id: "takeout", label: "Friday takeout", emoji: "🥡", amount: 32, perYear: 52, quip: "Cooking once a week is basically a salary." },
  { id: "sephora", label: "\"Just browsing\" Sephora run", emoji: "💄", amount: 45, perYear: 24, quip: "Twice a month. The cart was a suggestion." },
  { id: "rideshare", label: "Rideshare home", emoji: "🚗", amount: 18, perYear: 100, quip: "Walking is free cardio AND free money." },
];

module.exports = { quotes, scenarios };
