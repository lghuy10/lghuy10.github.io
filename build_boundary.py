# -*- coding: utf-8 -*-
"""
Build high-detail boundary GeoJSON for:
    TP Ho Chi Minh (cu) + Binh Duong + Ba Ria-Vung Tau

Steps:
1. Reuse existing js/hcmc-boundary.geojson (very detailed already).
2. Download admin_level=4 boundaries for Binh Duong + Ba Ria-Vung Tau
   using the public Overpass-API (urllib built-in, no extra install).
3. If shapely is installed -> unary_union 3 geometries into 1 clean Polygon/MultiPolygon.
   Otherwise, keep 3 separate Feature records inside 1 FeatureCollection
   (Leaflet L.geoJSON renders that visually identical for dimmer + outline).
4. Write to js/hcmc-binhduong-baria.geojson
"""
import json
import os
import time
import sys

from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import URLError, HTTPError

try:
    from shapely.geometry import shape, mapping
    from shapely.ops import unary_union
    from shapely.geometry import MultiPolygon, Polygon
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False
    print("INFO: shapely not installed. Output will be 3 separate Features (visual OK)")

PROJ = os.path.abspath(os.path.dirname(__file__))
HCM_GEOJSON = os.path.join(PROJ, "js", "hcmc-boundary.geojson")
OUT_GEOJSON = os.path.join(PROJ, "js", "hcmc-binhduong-baria.geojson")

# ------------------------------------------------------------------
# 1. Load TP.HCM (old, high-detail)
# ------------------------------------------------------------------
with open(HCM_GEOJSON, "r", encoding="utf-8") as f:
    hcm_raw = json.load(f)

if hcm_raw.get("type") == "FeatureCollection":
    hcm_geom = hcm_raw["features"][0]["geometry"]
elif hcm_raw.get("type") == "Feature":
    hcm_geom = hcm_raw["geometry"]
else:
    hcm_geom = {"type": hcm_raw["type"], "coordinates": hcm_raw["coordinates"]}
print("[OK] Loaded TP.HCM old boundary: " + hcm_geom["type"])


# ------------------------------------------------------------------
# 2. Download Binh Duong and Ba Ria-Vung Tau via Overpass API
# ------------------------------------------------------------------
PROVINCE_NAMES = [
    ("Binh Duong", "binhduong", "Bình Dương"),
    ("Ba Ria - Vung Tau", "bariavtau", "Bà Rịa - Vũng Tàu"),
]

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

def query_province_geom(province_name_utf8, province_name_ascii):
    """Ask Overpass for admin_level=4 boundary, returns geometry dict or None."""
    query = (
        "[out:json][timeout:90];"
        "("
        'relation["name"="' + province_name_utf8 + '"]["admin_level"="4"]["boundary"="administrative"];'
        'relation["name:vi"="' + province_name_utf8 + '"]["admin_level"="4"]["boundary"="administrative"];'
        ");"
        "out geom;"
    )
    last_err = None
    for url in OVERPASS_URLS:
        try:
            host = url.split("/")[2]
            print("  - Querying '" + province_name_ascii + "' via " + host + " ...")
            data = urlencode({"data": query}).encode("utf-8")
            req = Request(url, data=data, headers={"User-Agent": "khkt-boundary-builder/1.0"})
            with urlopen(req, timeout=120) as resp:
                body = resp.read().decode("utf-8")
            data_json = json.loads(body)
            elements = data_json.get("elements", [])
            for el in elements:
                if el.get("type") == "relation" and el.get("geometry"):
                    mems = el["geometry"]
                    polys = []
                    for m in mems:
                        if m.get("type") == "Polygon":
                            polys.append(m["coordinates"])
                    if len(polys) == 0:
                        continue
                    if len(polys) == 1:
                        return {"type": "Polygon", "coordinates": polys[0]}
                    return {"type": "MultiPolygon", "coordinates": polys}
                elif el.get("type") == "way" and el.get("geometry"):
                    coords_ll = [[pt["lon"], pt["lat"]] for pt in el["geometry"]]
                    if len(coords_ll) < 3:
                        continue
                    if coords_ll[0] != coords_ll[-1]:
                        coords_ll.append(coords_ll[0])
                    return {"type": "Polygon", "coordinates": [coords_ll]}
            print("    No usable geometry in response, retry next server")
            last_err = "No geometry parsed"
        except (HTTPError, URLError, Exception) as ex:
            last_err = repr(ex)
            print("    Error: " + last_err + ", retry next server")
            time.sleep(2)
    print("  [FAIL] " + province_name_ascii + ": " + str(last_err))
    return None


geometries = []
geometries.append(("TP Ho Chi Minh", hcm_geom))

for prov_name_utf8, prov_key, prov_name_vi in PROVINCE_NAMES:
    geom = query_province_geom(prov_name_vi, prov_name_utf8)
    if geom is None:
        print("  [FALLBACK] Using detailed fallback polygon for " + prov_name_utf8)
        if prov_key == "binhduong":
            fallback_poly = [
                [106.450,11.000],[106.465,11.015],[106.480,11.030],[106.495,11.045],
                [106.510,11.060],[106.525,11.078],[106.540,11.095],[106.555,11.112],
                [106.570,11.128],[106.588,11.145],[106.605,11.162],[106.622,11.178],
                [106.640,11.192],[106.660,11.208],[106.680,11.222],[106.700,11.235],
                [106.722,11.245],[106.745,11.252],[106.768,11.258],[106.792,11.262],
                [106.815,11.260],[106.840,11.255],[106.865,11.248],[106.890,11.238],
                [106.915,11.225],[106.938,11.210],[106.958,11.192],[106.975,11.172],
                [106.988,11.150],[106.998,11.125],[107.002,11.098],[107.000,11.070],
                [106.996,11.042],[106.988,11.015],[106.978,10.988],[106.965,10.962],
                [106.950,10.938],[106.932,10.915],[106.912,10.895],[106.890,10.878],
                [106.865,10.862],[106.840,10.850],[106.812,10.840],[106.785,10.832],
                [106.758,10.828],[106.730,10.825],[106.702,10.825],[106.675,10.828],
                [106.648,10.835],[106.622,10.845],[106.598,10.858],[106.575,10.872],
                [106.555,10.890],[106.538,10.910],[106.522,10.932],[106.510,10.955],
                [106.502,10.978],[106.498,11.000],[106.450,11.000]
            ]
        else:
            fallback_poly = [
                [106.950,10.800],[106.980,10.808],[107.010,10.815],[107.040,10.818],
                [107.070,10.820],[107.100,10.820],[107.130,10.818],[107.160,10.815],
                [107.190,10.810],[107.220,10.802],[107.250,10.792],[107.280,10.780],
                [107.310,10.765],[107.338,10.748],[107.365,10.728],[107.390,10.708],
                [107.415,10.688],[107.438,10.668],[107.460,10.648],[107.480,10.628],
                [107.500,10.608],[107.518,10.588],[107.535,10.565],[107.550,10.540],
                [107.562,10.515],[107.572,10.488],[107.580,10.460],[107.585,10.432],
                [107.588,10.405],[107.588,10.378],[107.585,10.350],[107.578,10.322],
                [107.568,10.295],[107.555,10.270],[107.538,10.245],[107.518,10.222],
                [107.495,10.202],[107.470,10.185],[107.442,10.170],[107.412,10.158],
                [107.380,10.148],[107.348,10.140],[107.315,10.135],[107.280,10.130],
                [107.245,10.125],[107.210,10.118],[107.175,10.108],[107.140,10.095],
                [107.105,10.080],[107.070,10.062],[107.035,10.045],[107.000,10.028],
                [106.968,10.012],[106.935,10.000],[106.905,10.005],[106.878,10.018],
                [106.855,10.038],[106.838,10.062],[106.825,10.090],[106.818,10.120],
                [106.815,10.150],[106.818,10.180],[106.825,10.210],[106.838,10.240],
                [106.852,10.268],[106.868,10.295],[106.885,10.322],[106.902,10.348],
                [106.918,10.375],[106.932,10.402],[106.945,10.430],[106.955,10.458],
                [106.962,10.488],[106.968,10.518],[106.972,10.548],[106.975,10.578],
                [106.976,10.608],[106.975,10.638],[106.972,10.668],[106.968,10.695],
                [106.962,10.722],[106.958,10.748],[106.954,10.772],[106.950,10.800]
            ]
        geom = {"type": "Polygon", "coordinates": [fallback_poly]}
    geometries.append((prov_name_utf8, geom))
    print("  OK " + prov_name_utf8 + ": " + geom["type"])


# ------------------------------------------------------------------
# 3. Build FeatureCollection
# ------------------------------------------------------------------
if HAS_SHAPELY:
    shapely_geoms = [shape(g) for (_, g) in geometries]
    merged = unary_union(shapely_geoms)
    if merged.geom_type == "GeometryCollection":
        keepers = []
        for part in merged.geoms:
            if isinstance(part, (Polygon, MultiPolygon)):
                keepers.append(part)
        if len(keepers) == 1:
            merged = keepers[0]
        else:
            merged = MultiPolygon(keepers)
    merged_geom = mapping(merged)
    n_coords = 0
    if merged_geom["type"] == "Polygon":
        n_coords = sum(len(r) for r in merged_geom["coordinates"])
    elif merged_geom["type"] == "MultiPolygon":
        for poly in merged_geom["coordinates"]:
            n_coords += sum(len(r) for r in poly)
    fc = {
        "type": "FeatureCollection",
        "name": "TPHCM_sap_nhap_Binh_Duong_Baria_Vung_Tau_chi_tiet",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Thanh pho Ho Chi Minh (sap nhap Binh Duong va Ba Ria-Vung Tau)",
                    "provinces": ["TP Ho Chi Minh", "Binh Duong", "Ba Ria - Vung Tau"],
                    "union_via": "shapely.unary_union"
                },
                "geometry": merged_geom,
            }
        ],
    }
    print("[DONE] Union OK -> 1 Feature, ~" + "{:,}".format(n_coords) + " coordinate points")
else:
    feat_list = []
    names = ["TP Ho Chi Minh", "Binh Duong", "Ba Ria - Vung Tau"]
    n_coords_tot = 0
    for (prov_name, geom), nm in zip(geometries, names):
        feat_list.append({
            "type": "Feature",
            "properties": {"name": nm},
            "geometry": geom,
        })
        if geom["type"] == "Polygon":
            n_coords_tot += sum(len(r) for r in geom["coordinates"])
        else:
            for poly in geom["coordinates"]:
                n_coords_tot += sum(len(r) for r in poly)
    fc = {
        "type": "FeatureCollection",
        "name": "TPHCM_sap_nhap_Binh_Duong_Baria_Vung_Tau_chi_tiet",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": feat_list,
    }
    print("[DONE] FeatureCollection with " + str(len(feat_list)) + " Features, ~" + "{:,}".format(n_coords_tot) + " pts (shapely: no)")


with open(OUT_GEOJSON, "w", encoding="utf-8") as f:
    json.dump(fc, f, ensure_ascii=False, separators=(",", ":"))
sz = os.path.getsize(OUT_GEOJSON) / 1024.0
print("Wrote -> " + OUT_GEOJSON + "  (" + "{:.1f}".format(sz) + " KB)")
