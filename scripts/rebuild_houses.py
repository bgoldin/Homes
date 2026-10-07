#!/usr/bin/env python3
"""Rebuild data/houses.js from the authoritative Hudson Valley spreadsheet.

Only rows with a numeric Score (1-5) are published. Existing geocodes are
preserved independently in data/geocode-cache.json and joined by normalized
address, so refreshing the sheet never destroys coordinate work.
"""
import argparse, json, re
from pathlib import Path
import pandas as pd

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/"data/geocode-cache.json"
OUT=ROOT/"data/houses.js"

def norm_address(value):
    return re.sub(r"\s+"," ",str(value or "").strip().lower())

def clean(value):
    if pd.isna(value): return ""
    if hasattr(value,"item"): value=value.item()
    return value

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("xlsx", help="Path to Hudson Valley House list.xlsx")
    ap.add_argument("--sheet", default="Hudson Valley")
    args=ap.parse_args()

    df=pd.read_excel(args.xlsx,sheet_name=args.sheet)
    required=["Score (1-5)","Address","Zillow Link","PicURL"]
    missing=[c for c in required if c not in df.columns]
    if missing: raise SystemExit("Missing required columns: "+", ".join(missing))

    scores=pd.to_numeric(df["Score (1-5)"],errors="coerce")
    df=df.loc[scores.notna()].copy()
    df["Score (1-5)"]=scores.loc[scores.notna()].astype(int)

    cache=json.loads(CACHE.read_text()) if CACHE.exists() else {}
    fields=["Scheduled","Where","Price","STR?","Yield","Beds","Baths","Sq ft","Acreage","Pool","Hot tub","Pond/stream","Barn","Comments","AirDNA analysis","AirDNA downloaded report","Leigh's Notes"]
    houses=[]
    for _,r in df.iterrows():
        address=str(clean(r["Address"])).strip()
        h={c:clean(r[c]) if c in df.columns else "" for c in fields}
        h.update({
            "score":int(r["Score (1-5)"]),
            "address":address,
            "zillow":str(clean(r["Zillow Link"])).strip(),
            "picUrl":str(clean(r["PicURL"])).strip(),
        })
        geo=cache.get(norm_address(address))
        if geo: h.update(geo)
        houses.append(h)

    OUT.write_text("window.HOUSES = "+json.dumps(houses,indent=2,ensure_ascii=False)+";\n")
    unresolved=[h["address"] for h in houses if "lat" not in h or "lng" not in h]
    print(f"Rebuilt {len(houses)} scored houses; {len(unresolved)} need coordinates.")
    for a in unresolved: print("  -",a)

if __name__=="__main__": main()
