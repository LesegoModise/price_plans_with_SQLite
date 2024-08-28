CREATE TABLE price_plan_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_name TEXT,
    total REAL,
    updated_at TEXT DEFAULT (datetime('now'))
);