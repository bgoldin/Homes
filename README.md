# Hudson Valley Houses

Mobile-first map for reviewing scored Hudson Valley properties.

## Live site

The site is published with GitHub Pages from the `main` branch.

## Source of truth

The authoritative source for house data is the Google Sheet named **Hudson Valley House list**, specifically the **Hudson Valley** tab.

The Google Sheet is connected to ChatGPT through Google Drive. The repository does **not** independently authenticate to Google or automatically poll the sheet.

Only rows with a numeric value in **Score (1-5)** belong in the map.

## Rebuilding the house map

The normal maintenance workflow is manual.

After updating the Google Sheet, ask ChatGPT:

> rebuild the house map

ChatGPT should then:

1. Read the **current** `Hudson Valley House list` directly from the connected Google Drive using the existing exact file reference when available. Do not rely on an old exported spreadsheet when current Drive access is available.
2. Read the **Hudson Valley** tab.
3. Treat the sheet as authoritative and completely rebuild the generated house dataset. Do not preserve stale house records merely because they exist in GitHub.
4. Include only rows where **Score (1-5)** is numeric.
5. Carry the relevant sheet fields into the generated data, including Address, Score, Zillow Link, PicURL, price/property attributes, comments, notes, scheduling/status fields, and other useful columns.
6. Preserve known latitude/longitude values by matching normalized addresses against the persistent geocode cache.
7. Geocode only addresses that are new or whose address has materially changed. Never invent or approximate a property location merely to make it appear on the map.
8. Rebuild `data/houses.js`.
9. Preserve/update the persistent geocode cache separately from the generated house records.
10. Commit the rebuilt data to `bgoldin/Homes` on `main`.
11. Allow GitHub Pages to redeploy and verify that the deployment succeeds.

### Important rebuild behavior

The Google Sheet wins.

- A house removed from the scored rows should disappear from the map.
- A changed score, photo, Zillow link, comment, price, or property attribute should replace the previous GitHub value.
- A newly scored house should be added.
- A row whose score is cleared or becomes non-numeric should be removed.
- Existing geocodes should survive ordinary rebuilds so addresses do not need to be geocoded repeatedly.

## Repository structure

- `index.html` — map page
- `styles.css` — responsive/mobile styling
- `app.js` — Leaflet map and property-card behavior
- `data/houses.js` — generated current house dataset used by the site
- `data/geocode-cache.json` — persistent address-to-coordinate cache (when present)
- `scripts/` — rebuild/support scripts (when present)

## Design principle

The spreadsheet is the editing interface; this site is the viewing interface.

Do not manually maintain duplicate property information in the web application. Property content should flow from the Google Sheet during a rebuild, while derived technical information such as geocoding may be retained separately.
