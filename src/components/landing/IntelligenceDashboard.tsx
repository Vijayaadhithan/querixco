import { useId, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  MousePointer2,
  Search,
} from "lucide-react";

const topics = [
  {
    category: "Fashion",
    label: "Cotton workwear",
    query: "cotton shirts for work",
    price: 28,
    found: true,
  },
  {
    category: "Fashion",
    label: "Everyday essentials",
    query: "comfortable everyday basics",
    price: 18,
    found: true,
  },
  {
    category: "Fashion",
    label: "Summer layers",
    query: "lightweight summer blazer",
    price: 65,
    found: false,
  },
  {
    category: "Fashion",
    label: "Occasion wear",
    query: "linen suit under $100",
    price: 95,
    found: true,
  },
  {
    category: "Beauty",
    label: "Fragrance-free care",
    query: "fragrance-free moisturizer",
    price: 24,
    found: true,
  },
  {
    category: "Beauty",
    label: "Daily routines",
    query: "daily gentle cleanser",
    price: 15,
    found: true,
  },
  {
    category: "Beauty",
    label: "Refillable skincare",
    query: "refillable face moisturizer",
    price: 42,
    found: false,
  },
  { category: "Beauty", label: "Hair care", query: "shampoo for dry hair", price: 12, found: true },
];
// Synthetic activity is isolated from authenticated customer analytics.
const activity = Array.from({ length: 28 }, (_, day) =>
  topics.map((topic, i) => {
    const searches = 8 + ((day * 7 + i * 11) % 23) + Math.floor(day / 4);
    return {
      ...topic,
      day: day + 1,
      searches,
      clicks: topic.found ? Math.floor(searches * (0.5 + (i % 3) * 0.1)) : 0,
    };
  }),
).flat();

export function IntelligenceDashboard() {
  const [category, setCategory] = useState("All catalogues");
  const [days, setDays] = useState(28);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const gradientId = useId().replaceAll(":", "");
  const rows = activity.filter(
    (r) => r.day > 28 - days && (category === "All catalogues" || r.category === category),
  );
  const count = rows.reduce((sum, r) => sum + r.searches, 0);
  const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const unmet = rows.filter((r) => !r.found).reduce((sum, r) => sum + r.searches, 0);
  const interests = topics
    .filter((t) => category === "All catalogues" || t.category === category)
    .map((t) => ({
      ...t,
      count: rows.filter((r) => r.label === t.label).reduce((sum, r) => sum + r.searches, 0),
    }))
    .sort((a, b) => b.count - a.count);
  const active = interests.find((t) => t.label === selected) ?? interests[0];
  const trend = Array.from({ length: days }, (_, i) => ({
    day: 29 - days + i,
    count: rows.filter((r) => r.day === 29 - days + i).reduce((sum, r) => sum + r.searches, 0),
  }));
  const maximum = Math.max(...trend.map((r) => r.count)) * 1.25;
  const points = trend.map((r, i) => [
    20 + (i * 660) / (days - 1),
    145 - (r.count / maximum) * 120,
  ]);
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const pointIndex = hovered ?? days - 1;
  const buckets = [
    { label: "Under $20", min: 0, max: 20 },
    { label: "$20–$40", min: 20, max: 40 },
    { label: "$40–$80", min: 40, max: 80 },
    { label: "$80+", min: 80, max: Infinity },
  ];
  const n = (value: number) => value.toLocaleString("en-US");
  return (
    <div className="ql-dashboard">
      <div className="ql-dash-top">
        <div>
          <BarChart3 size={19} />
          <strong>Commerce intelligence</strong>
          <span className="ql-sample-badge">Illustrative data</span>
        </div>
        <div className="ql-dash-filters">
          <label>
            <span className="qx-sr-only">Dashboard catalogue</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelected(null);
                setHovered(null);
              }}
            >
              <option>All catalogues</option>
              <option>Fashion</option>
              <option>Beauty</option>
            </select>
          </label>
          <label>
            <span className="qx-sr-only">Dashboard period</span>
            <select
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setHovered(null);
              }}
            >
              <option value={28}>28 sample days</option>
              <option value={7}>7 sample days</option>
            </select>
          </label>
        </div>
      </div>
      <div className="ql-dash-body">
        <div className="ql-dash-metrics">
          {[
            {
              label: "Search interactions",
              value: n(count),
              icon: Search,
              note: "What shoppers ask for",
            },
            {
              label: "Product engagements",
              value: n(clicks),
              icon: MousePointer2,
              note: "Exploration after a search",
            },
            {
              label: "Unmet searches",
              value: n(unmet),
              icon: ArrowDownRight,
              note: "Opportunities in your catalogue",
            },
          ].map(({ label, value, icon: Icon, note }) => (
            <div key={label}>
              <span>
                {label}
                <Icon size={16} />
              </span>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          ))}
        </div>
        <div className="ql-dash-main">
          <div className="ql-trend">
            <div className="ql-chart-heading">
              <h3>Search activity</h3>
              <span>
                <i /> Search interactions
              </span>
            </div>
            <div className="ql-trend-label" role="status">
              Day {trend[pointIndex].day}
              <strong>{trend[pointIndex].count} searches</strong>
            </div>
            <div className="ql-trend-plot">
              <svg
                viewBox="0 0 700 170"
                role="img"
                aria-label={`Search interactions over ${days} sample days, ${count} searches in total.`}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#65A5FF" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#65A5FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[35, 90, 145].map((y) => (
                  <line
                    key={y}
                    x1="20"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke="#ffffff12"
                    strokeDasharray="4 6"
                  />
                ))}
                <polygon points={`20,155 ${line} 680,155`} fill={`url(#${gradientId})`} />
                <polyline
                  points={line}
                  fill="none"
                  stroke="#65A5FF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <line
                  x1={points[pointIndex][0]}
                  y1="20"
                  x2={points[pointIndex][0]}
                  y2="155"
                  stroke="#65A5FF"
                  strokeOpacity=".3"
                />
                <circle
                  cx={points[pointIndex][0]}
                  cy={points[pointIndex][1]}
                  r="4"
                  fill="#18C7D9"
                  stroke="#101E38"
                  strokeWidth="2"
                />
              </svg>
              <div
                className="ql-chart-targets"
                style={{ gridTemplateColumns: `repeat(${days},1fr)` }}
              >
                {trend.map((r, i) => (
                  <button
                    key={r.day}
                    aria-label={`Day ${r.day}: ${r.count} searches`}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onClick={() => setHovered(i)}
                  />
                ))}
              </div>
            </div>
            <div className="ql-axis">
              <span>Day {29 - days}</span>
              <span>Day {Math.round(28 - days / 2)}</span>
              <span>Day 28</span>
            </div>
          </div>
          <div className="ql-interest">
            <div className="ql-chart-heading">
              <h3>Customer interests</h3>
              <Activity size={14} />
            </div>
            {interests.slice(0, 4).map((t) => (
              <button
                className="ql-interest-row"
                key={t.label}
                aria-pressed={active.label === t.label}
                onClick={() => setSelected(t.label)}
              >
                <span>
                  {t.label}
                  <strong>{Math.round((t.count / count) * 100)}%</strong>
                </span>
                <i>
                  <i
                    style={{
                      width: `${(t.count / Math.max(...interests.map((item) => item.count))) * 100}%`,
                    }}
                  />
                </i>
              </button>
            ))}
            <div className="ql-query-detail">
              <span>BEHIND THE INTEREST</span>
              <p>“{active.query}”</p>
              <small>
                {n(active.count)} sample searches <ChevronRight size={12} />
              </small>
            </div>
          </div>
        </div>
        <div className="ql-dash-secondary">
          <div className="ql-price">
            <div className="ql-chart-heading">
              <h3>Price preferences</h3>
              <span>Search budgets</span>
            </div>
            <div className="ql-price-buckets">
              {buckets.map((bucket) => {
                const amount = rows
                  .filter((r) => r.price >= bucket.min && r.price < bucket.max)
                  .reduce((sum, r) => sum + r.searches, 0);
                const percent = Math.round((amount / count) * 100);
                return (
                  <div key={bucket.label}>
                    <span>{bucket.label}</span>
                    <strong>{percent}%</strong>
                    <i>
                      <i style={{ width: `${percent}%` }} />
                    </i>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ql-unmet">
            <div className="ql-chart-heading">
              <h3>Unmet demand</h3>
              <span>Searches without a match</span>
            </div>
            {interests
              .filter((t) => !t.found)
              .map((t) => (
                <button
                  key={t.label}
                  onClick={() => setSelected(t.label)}
                  aria-pressed={active.label === t.label}
                >
                  <Search size={14} />
                  <span>{t.query}</span>
                  <strong>{t.count}</strong>
                  <ArrowUpRight size={14} />
                </button>
              ))}
          </div>
        </div>
      </div>
      <div className="ql-dash-foot">
        <span>
          <i /> Explore the filters, chart and customer interests
        </span>
        <span>Synthetic preview · No customer data</span>
      </div>
    </div>
  );
}
