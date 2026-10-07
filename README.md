# Hudson Valley Houses

Mobile-first map for reviewing scored Hudson Valley properties.

## Source of truth

The **Hudson Valley House list** spreadsheet is authoritative. The published dataset is rebuilt from scratch from that sheet; only rows with a numeric `Score (1-5)` are included.

## Refresh workflow

1. Export/download the current spreadsheet as `Hudson Valley House list.xlsx`.
2. Run:
   ```bash
   python scripts/rebuild_houses.py "Hudson Valley House list.xlsx"
   ```
3. Review any addresses reported as needing coordinates.
4. Commit the regenerated `data/houses.js`.

The rebuild wipes and recreates the house dataset from the current sheet, so deleted/unscored rows disappear and edits are reflected automatically.

## Geocoding

Coordinates live separately in `data/geocode-cache.json`, keyed by normalized address. Rebuilding house data preserves those coordinates. A new or changed address is left unmapped until its coordinates are reviewed and added to the cache.

This keeps geocoding durable without allowing stale spreadsheet data to accumulate in the app.
