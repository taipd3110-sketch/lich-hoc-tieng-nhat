"""Tải dữ liệu OpenStreetMap quanh 12 địa danh và xuất JSON gọn cho cảnh 3D.
Chạy trên GitHub Actions (máy chủ phát triển không truy cập được Overpass).
Dữ liệu © OpenStreetMap contributors, giấy phép ODbL."""
import json, math, time, urllib.request, urllib.parse, os, sys
from shapely.geometry import Polygon, LineString, MultiLineString, box, Point
from shapely.ops import unary_union, polygonize, linemerge
from shapely.validation import make_valid

R = 1000  # bán kính (m)
SC = [
 (1, "伏見稲荷大社", 34.96714, 135.77267),
 (2, "白川郷 荻町", 36.25780, 136.90630),
 (3, "新倉山浅間公園 忠霊塔", 35.50130, 138.80200),
 (4, "姫路城", 34.83940, 134.69390),
 (5, "東京タワー", 35.65858, 139.74543),
 (6, "明月院", 35.33700, 139.55200),
 (7, "厳島神社 大鳥居", 34.29590, 132.31920),
 (8, "隅田公園", 35.71210, 139.80200),
 (9, "姨捨の棚田", 36.50400, 138.09450),
 (10, "金閣寺", 35.03940, 135.72920),
 (11, "河口湖 もみじ回廊", 35.51560, 138.74480),
 (12, "大通公園", 43.06000, 141.35000),
]
EP = ["https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]
UA = {"User-Agent": "lich-hoc-tieng-nhat/1.0 (study site; github.com/taipd3110-sketch)"}

def overpass(q, tries=8):
    for k in range(tries):
        url = EP[k % len(EP)]
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(), headers=UA)
            with urllib.request.urlopen(req, timeout=150) as r:
                return json.load(r)
        except Exception as e:
            print("  overpass retry", url, e, flush=True); time.sleep(15 + 5 * k)
    raise SystemExit("overpass failed")

def geocode(name, lat, lon):
    try:
        u = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": name, "format": "json", "limit": 1, "countrycodes": "jp"})
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r:
            j = json.load(r)
        time.sleep(1.2)
        if j:
            la, lo = float(j[0]["lat"]), float(j[0]["lon"])
            d = math.hypot((lo - lon) * 111320 * math.cos(math.radians(lat)), (la - lat) * 110540)
            print(f"  geocode {name}: {la:.5f},{lo:.5f} (lệch {d:.0f} m)")
            if d < 2500: return la, lo
    except Exception as e:
        print("  geocode fail", e)
    return lat, lon

def proj(lat0, lon0):
    kx = 111320 * math.cos(math.radians(lat0)); kz = 110540
    return lambda la, lo: ((lo - lon0) * kx, -(la - lat0) * kz)  # x: đông, z: nam (bắc = -z)

def rnd(c): return [round(c[0], 1), round(c[1], 1)]

def poly_out(p, tol):
    p = p.simplify(tol, preserve_topology=True)
    out = []
    for g in (p.geoms if hasattr(p, "geoms") else [p]):
        if g.geom_type != "Polygon" or g.area < 6: continue
        rings = [[rnd(c) for c in list(g.exterior.coords)[:-1]]] + [[rnd(c) for c in list(i.coords)[:-1]] for i in g.interiors if Polygon(i).area > 6]
        if len(rings[0]) >= 3: out.append(rings)
    return out

def line_out(l, tol):
    l = l.simplify(tol)
    out = []
    for g in (l.geoms if hasattr(l, "geoms") else [l]):
        if g.geom_type == "LineString" and g.length > 2: out.append([rnd(c) for c in g.coords])
    return out

RW = {"motorway": 16, "trunk": 14, "primary": 12, "secondary": 10, "tertiary": 8, "unclassified": 6, "residential": 6, "living_street": 5,
      "service": 4, "pedestrian": 6, "footway": 2.5, "path": 2.2, "cycleway": 2.5, "steps": 2.5, "track": 3, "motorway_link": 8, "trunk_link": 8, "primary_link": 7, "secondary_link": 6, "tertiary_link": 6}
LAND = {"forest": "forest", "wood": "forest", "scrub": "forest", "park": "park", "garden": "park", "grass": "park", "meadow": "park", "village_green": "park",
        "recreation_ground": "park", "pitch": "park", "farmland": "farm", "paddy": "farm", "orchard": "farm", "cemetery": "cem", "beach": "sand", "sand": "sand", "bare_rock": "rock"}

def run(sid, name, lat, lon):
    global R
    R = 800 if sid in (8,) else 1000
    print(f"[{sid}] {name}", flush=True)
    lat, lon = geocode(name, lat, lon)
    P = proj(lat, lon); BB = box(-R, -R, R, R)
    dla = R * 1.05 / 110540; dlo = R * 1.05 / (111320 * math.cos(math.radians(lat)))
    A = f"({lat-dla:.5f},{lon-dlo:.5f},{lat+dla:.5f},{lon+dlo:.5f})"
    q = f"""[out:json][timeout:200];(
way["building"]{A};relation["building"]{A};
way["highway"]{A};way["railway"~"^(rail|subway|light_rail|tram|narrow_gauge|monorail)$"]{A};
way["waterway"~"^(river|stream|canal|ditch|drain)$"]{A};
way["natural"~"^(water|wood|scrub|beach|sand|bare_rock)$"]{A};relation["natural"~"^(water|wood)$"]{A};
way["water"]{A};way["landuse"~"^(forest|grass|meadow|farmland|orchard|cemetery|village_green|recreation_ground|reservoir|basin|paddy)$"]{A};
relation["landuse"~"^(forest|reservoir)$"]{A};way["leisure"~"^(park|garden|pitch)$"]{A};relation["leisure"="park"]{A};
way["natural"="coastline"]({lat-dla*3:.5f},{lon-dlo*3:.5f},{lat+dla*3:.5f},{lon+dlo*3:.5f});
);out geom;"""
    qp = f"""[out:json][timeout:120];(
nwr["name"]["tourism"~"^(attraction|viewpoint|museum)$"]{A};nwr["name"]["historic"]{A};nwr["name"]["amenity"="place_of_worship"]{A};
nwr["name"]["man_made"~"^(tower|torii|lighthouse|bridge)$"]{A};nwr["name"]["building"~"^(shrine|temple|castle|tower)$"]{A};nwr["name"]["leisure"="park"]{A};
nwr["name"]["bridge"="yes"]["highway"]{A};node["natural"="peak"]["name"]{A};
);out center tags;"""
    qb = f"""[out:json][timeout:200];(way["building"]{A};relation["building"]{A};);out geom;"""
    qo = q.replace(f'way["building"]{A};relation["building"]{A};', "")
    els = overpass(qb)["elements"] + overpass(qo)["elements"]; print("  phần tử:", len(els), flush=True)
    def ring(geom): return [P(g["lat"], g["lon"]) for g in geom]
    def wpoly(e):
        if e["type"] == "way":
            pts = ring(e.get("geometry", []))
            if len(pts) < 4 or pts[0] != pts[-1]: return None
            return make_valid(Polygon(pts))
        outer = [LineString(ring(m["geometry"])) for m in e.get("members", []) if m.get("role") in ("outer", "") and m.get("geometry") and len(m["geometry"]) > 1]
        inner = [LineString(ring(m["geometry"])) for m in e.get("members", []) if m.get("role") == "inner" and m.get("geometry") and len(m["geometry"]) > 1]
        po = unary_union(list(polygonize(unary_union(outer)))) if outer else None
        if po is None or po.is_empty: return None
        if inner:
            pi = unary_union(list(polygonize(unary_union(inner))))
            if not pi.is_empty: po = po.difference(pi)
        return make_valid(po)
    pois = []
    try:
        dp = overpass(qp, 2)
        seen = set()
        for e in dp["elements"]:
            t = e.get("tags", {}); nm = t.get("name");
            c = e.get("center") or ({"lat": e["lat"], "lon": e["lon"]} if "lat" in e else None)
            if not nm or not c or nm in seen: continue
            seen.add(nm); x, z = P(c["lat"], c["lon"])
            if abs(x) <= R * 1.2 and abs(z) <= R * 1.2:
                kind = t.get("man_made") or t.get("historic") or t.get("tourism") or t.get("amenity") or t.get("building") or t.get("leisure") or t.get("natural") or "poi"
                pois.append([nm, kind, round(x, 1), round(z, 1)])
    except SystemExit:
        print("  không lấy được POI")
    out = {"c": [round(lat, 6), round(lon, 6)], "R": R, "name": name, "sea": [], "water": [], "river": [], "land": [], "road": [], "rail": [], "b": [], "poi": pois}
    blds = []; waters = []; coast = []
    for e in els:
        t = e.get("tags", {})
        try:
            if "building" in t or t.get("building:part"):
                p = wpoly(e)
                if p is None or p.is_empty: continue
                p = p.intersection(BB)
                if p.is_empty or p.area < 12: continue
                h = None
                try: h = float(str(t.get("height", "")).replace("m", "").strip())
                except: pass
                if not h:
                    try: h = float(t.get("building:levels")) * 3.2 + 1
                    except: h = None
                bt = t.get("building", "yes"); rel = t.get("religion", ""); am = t.get("amenity", "")
                kind = "s" if (rel == "shinto" or bt == "shrine") else "t" if (rel == "buddhist" or bt == "temple") else "h" if bt in ("house", "detached", "residential", "terrace", "hut", "farm", "bungalow") else "a" if bt in ("apartments", "dormitory", "hotel") else "c" if bt in ("commercial", "retail", "office", "public", "school", "university", "hospital", "train_station", "civic", "government") else "o"
                if not h: h = {"h": 7, "a": 16, "c": 13, "s": 9, "t": 10, "o": 7}[kind]
                blds.append((p.area, min(h, 120), kind, p, t.get("name", "")))
            elif t.get("natural") == "coastline":
                coast.append(LineString(ring(e["geometry"])))
            elif t.get("highway") in RW and e["type"] == "way":
                hw = t["highway"]; l = LineString(ring(e["geometry"])).intersection(BB)
                if t.get("area") == "yes": continue
                for s in line_out(l, 1.0): out["road"].append([RW[hw], 1 if hw in ("footway", "path", "steps", "cycleway", "track") else 0, s])
            elif t.get("railway") and e["type"] == "way":
                l = LineString(ring(e["geometry"])).intersection(BB)
                for s in line_out(l, 1.0): out["rail"].append(s)
            elif t.get("waterway") and e["type"] == "way":
                l = LineString(ring(e["geometry"])).intersection(BB)
                w = {"river": 18, "canal": 10, "stream": 3.5, "ditch": 2, "drain": 2}[t["waterway"]]
                for s in line_out(l, 1.0): out["river"].append([w, s])
            elif t.get("natural") == "water" or t.get("water") or t.get("landuse") in ("reservoir", "basin"):
                p = wpoly(e)
                if p is not None and not p.is_empty: waters.append(p.intersection(BB))
            else:
                cls = LAND.get(t.get("landuse")) or LAND.get(t.get("natural")) or LAND.get(t.get("leisure"))
                if cls:
                    p = wpoly(e)
                    if p is None or p.is_empty: continue
                    p = p.intersection(BB)
                    if not p.is_empty: out["land"].extend([[cls, r] for r in poly_out(p, 2.0)])
        except Exception as ex:
            print("  bỏ qua", e.get("id"), ex)
    if waters:
        out["water"] = poly_out(unary_union([w for w in waters if not w.is_empty]), 1.5)
    if coast:
        u = unary_union(coast)
        cl = linemerge(u) if u.geom_type == "MultiLineString" else u
        lines = [cl] if cl.geom_type == "LineString" else list(cl.geoms)
        lines = [l for l in lines if l.intersects(BB)]
        if lines:
            pieces = list(polygonize(unary_union([BB.exterior] + [l.intersection(BB.buffer(1)) for l in lines])))
            sea = []
            for pc in pieces:
                rp = pc.representative_point(); best = None
                for l in lines:
                    dd = l.distance(rp)
                    if best is None or dd < best[0]: best = (dd, l)
                l = best[1]; pr = l.project(rp); a = l.interpolate(max(0, pr - 2)); b = l.interpolate(min(l.length, pr + 2))
                cr = (b.x - a.x) * (rp.y - a.y) - (b.y - a.y) * (rp.x - a.x)
                # OSM: đất bên trái hướng đường bờ biển. Ở hệ toạ độ này z hướng nam (lật trục) nên dấu đổi chiều.
                if cr > 0: sea.append(pc)
            if sea: out["sea"] = poly_out(unary_union(sea), 2.0)
    blds.sort(key=lambda x: -x[0])
    for area, h, kind, p, nm in blds[:3500]:
        for rings in poly_out(p, 0.8):
            out["b"].append([round(h, 1), kind, rings[0]] + ([nm] if nm and area > 400 else []))
    for k in ("sea", "water", "river", "land", "road", "rail", "b"): print(f"  {k}: {len(out[k])}")
    os.makedirs("scenes", exist_ok=True)
    with open(f"scenes/osm-{sid}.json", "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("  kích thước:", os.path.getsize(f"scenes/osm-{sid}.json") // 1024, "KB", flush=True)
    time.sleep(5)

if __name__ == "__main__":
    only = [int(x) for x in sys.argv[1:]] or [s[0] for s in SC]
    for s in SC:
        if s[0] in only: run(*s)
