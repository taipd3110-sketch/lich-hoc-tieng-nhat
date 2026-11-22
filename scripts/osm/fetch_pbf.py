"""Dựng dữ liệu cảnh từ gói bản đồ Geofabrik (ổn định hơn Overpass).
Dùng: python fetch_pbf.py <id> <tên> <lat> <lon> <vùng> [R]  -> scenes/osm-<id>.json (id dạng L3 -> lesson-3.json)
Dữ liệu © OpenStreetMap contributors (ODbL)."""
import json, math, os, sys, subprocess
from shapely.geometry import shape, box, Polygon, LineString
from shapely.ops import transform, unary_union, polygonize, linemerge
sys.path.insert(0, os.path.dirname(__file__))
from fetch import RW, LAND, poly_out, line_out, proj

def main(sid, name, lat, lon, region, R=1000):
    R = float(R); lat = float(lat); lon = float(lon)
    pbf = f"/tmp/{region}.osm.pbf"
    if not os.path.exists(pbf):
        subprocess.run(["curl", "-sSL", "-o", pbf, f"https://download.geofabrik.de/asia/japan/{region}-latest.osm.pbf"], check=True)
    dla = R * 1.6 / 110540; dlo = R * 1.6 / (111320 * math.cos(math.radians(lat)))
    subprocess.run(["osmium", "extract", "-b", f"{lon-dlo},{lat-dla},{lon+dlo},{lat+dla}", pbf, "-o", "/tmp/area.pbf", "--overwrite", "-s", "smart"], check=True)
    subprocess.run(["osmium", "export", "/tmp/area.pbf", "-f", "geojsonseq", "-o", "/tmp/area.geojsonseq", "--overwrite", "-u", "type_id"], check=True)
    P = proj(lat, lon); BB = box(-R, -R, R, R); BIG = box(-R * 3, -R * 3, R * 3, R * 3)
    tf = lambda x, y, z=None: P(y, x)
    out = {"c": [round(lat, 6), round(lon, 6)], "R": R, "name": name, "sea": [], "water": [], "river": [], "land": [], "road": [], "rail": [], "b": [], "poi": []}
    blds, waters, coast, seen = [], [], [], set()
    with open("/tmp/area.geojsonseq", encoding="utf-8") as f:
        for line in f:
            line = line.strip().lstrip("\x1e")
            if not line: continue
            ft = json.loads(line); t = ft.get("properties") or {}; g0 = ft.get("geometry")
            if not g0: continue
            try: g = transform(tf, shape(g0))
            except Exception: continue
            gt = g.geom_type
            nm = t.get("name")
            if nm and nm not in seen and (t.get("tourism") in ("attraction", "viewpoint", "museum") or t.get("historic") or t.get("amenity") == "place_of_worship" or t.get("man_made") in ("tower", "torii", "lighthouse", "bridge") or t.get("building") in ("shrine", "temple", "castle", "tower") or t.get("leisure") == "park" or t.get("natural") == "peak" or t.get("railway") == "station"):
                c = g.centroid
                if abs(c.x) <= R * 1.2 and abs(c.y) <= R * 1.2:
                    seen.add(nm); kind = t.get("man_made") or t.get("historic") or t.get("tourism") or t.get("amenity") or t.get("building") or t.get("leisure") or t.get("natural") or t.get("railway") or "poi"
                    out["poi"].append([nm, kind, round(c.x, 1), round(c.y, 1)])
            try:
                if ("building" in t or "building:part" in t) and gt in ("Polygon", "MultiPolygon"):
                    p = g.intersection(BB)
                    if p.is_empty or p.area < 12: continue
                    h = None
                    try: h = float(str(t.get("height", "")).replace("m", "").strip())
                    except: pass
                    if not h:
                        try: h = float(t.get("building:levels")) * 3.2 + 1
                        except: h = None
                    bt = t.get("building", "yes"); rel = t.get("religion", "")
                    kind = "s" if (rel == "shinto" or bt == "shrine") else "t" if (rel == "buddhist" or bt == "temple") else "h" if bt in ("house", "detached", "residential", "terrace", "hut", "farm", "bungalow") else "a" if bt in ("apartments", "dormitory", "hotel") else "c" if bt in ("commercial", "retail", "office", "public", "school", "university", "hospital", "train_station", "civic", "government") else "o"
                    if not h: h = {"h": 7, "a": 16, "c": 13, "s": 9, "t": 10, "o": 7}[kind]
                    blds.append((p.area, min(h, 120), kind, p, nm or ""))
                elif t.get("natural") == "coastline" and gt == "LineString":
                    if g.intersects(BIG): coast.append(g)
                elif t.get("highway") in RW and gt == "LineString" and t.get("area") != "yes":
                    hw = t["highway"]
                    for s in line_out(g.intersection(BB), 1.0): out["road"].append([RW[hw], 1 if hw in ("footway", "path", "steps", "cycleway", "track") else 0, s])
                elif t.get("railway") in ("rail", "subway", "light_rail", "tram", "narrow_gauge", "monorail") and gt == "LineString":
                    for s in line_out(g.intersection(BB), 1.0): out["rail"].append(s)
                elif t.get("waterway") in ("river", "canal", "stream", "ditch", "drain") and gt == "LineString":
                    w = {"river": 18, "canal": 10, "stream": 3.5, "ditch": 2, "drain": 2}[t["waterway"]]
                    for s in line_out(g.intersection(BB), 1.0): out["river"].append([w, s])
                elif gt in ("Polygon", "MultiPolygon") and (t.get("natural") == "water" or t.get("water") or t.get("landuse") in ("reservoir", "basin")):
                    waters.append(g.intersection(BB))
                elif gt in ("Polygon", "MultiPolygon"):
                    cls = LAND.get(t.get("landuse")) or LAND.get(t.get("natural")) or LAND.get(t.get("leisure"))
                    if cls:
                        p = g.intersection(BB)
                        if not p.is_empty: out["land"].extend([[cls, r] for r in poly_out(p, 2.0)])
            except Exception as ex:
                print("  bỏ qua", ex)
    if waters: out["water"] = poly_out(unary_union([w for w in waters if not w.is_empty]), 1.5)
    if coast:
        u = unary_union(coast); cl = linemerge(u) if u.geom_type == "MultiLineString" else u
        lines = [cl] if cl.geom_type == "LineString" else list(cl.geoms); lines = [l for l in lines if l.intersects(BB)]
        if lines:
            pieces = list(polygonize(unary_union([BB.exterior] + [l.intersection(BB.buffer(1)) for l in lines]))); sea = []
            for pc in pieces:
                rp = pc.representative_point(); best = min(((l.distance(rp), l) for l in lines), key=lambda x: x[0])[1]
                pr = best.project(rp); a = best.interpolate(max(0, pr - 2)); b = best.interpolate(min(best.length, pr + 2))
                if (b.x - a.x) * (rp.y - a.y) - (b.y - a.y) * (rp.x - a.x) > 0: sea.append(pc)
            if sea: out["sea"] = poly_out(unary_union(sea), 2.0)
    blds.sort(key=lambda x: -x[0])
    for area, h, kind, p, nm in blds[:4000]:
        for rings in poly_out(p, 0.8): out["b"].append([round(h, 1), kind, rings[0]] + ([nm] if nm and area > 400 else []))
    for k in ("sea", "water", "river", "land", "road", "rail", "b", "poi"): print(f"  {k}: {len(out[k])}")
    os.makedirs("scenes", exist_ok=True)
    fn = f"scenes/lesson-{sid[1:]}.json" if sid.startswith("L") else f"scenes/osm-{sid}.json"
    with open(fn, "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("  ->", fn, os.path.getsize(fn) // 1024, "KB")

if __name__ == "__main__":
    main(*sys.argv[1:])
