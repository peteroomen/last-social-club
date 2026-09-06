# First Sitting baseline

1,000 seeded nights through the actual engine. All four seats use simple own-hand heuristic policies, alternating Bookkeeper and Gatekeeper starts; no shop purchases, and courtyard recovery is taken. Reproduce with `npm run simulate` on v0.1.

| Metric | Result |
| --- | ---: |
| Nights completed without zero Composure | 1,000 / 1,000 |
| Mean night score | 312.835 |
| Minimum / maximum score | 30 / 920 |
| Player contracts made | 993 / 1,215 |
| Rival contracts set | 401 / 1,785 |

These are policy diagnostics, not balance validation. In this baseline, defending sets fewer contracts than declaring makes, and starting Composure plus recovery is forgiving. A human sees both partnership hands, so these rates do not estimate human difficulty. Shop purchases and specialised builds are absent from the baseline.

Next balance work should compare deliberate defence against aggressive and precision bidding over shared seeds, including purchases, and use the first phone playtest to measure actual deal duration and friction. Keep score gates unset until those results exist.
