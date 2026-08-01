import math, os

OUT = "assets"
os.makedirs(OUT, exist_ok=True)

COLORWAYS = {
    "signature":  dict(ground="#2a211a", line="#f5f0e8", accent="#a67c3d"),
    "inverse":    dict(ground="#f5f0e8", line="#2a211a", accent="#a67c3d"),
    "warm-stone": dict(ground="#d9cfc1", line="#2a211a", accent="#a67c3d"),
}

def bez_point(p0, p1, p2, p3, t):
    x = (1-t)**3*p0[0] + 3*(1-t)**2*t*p1[0] + 3*(1-t)*t**2*p2[0] + t**3*p3[0]
    y = (1-t)**3*p0[1] + 3*(1-t)**2*t*p1[1] + 3*(1-t)*t**2*p2[1] + t**3*p3[1]
    return (x, y)

def bez_tangent_deg(p0, p1, p2, p3, t):
    dx = 3*(1-t)**2*(p1[0]-p0[0]) + 6*(1-t)*t*(p2[0]-p1[0]) + 3*t**2*(p3[0]-p2[0])
    dy = 3*(1-t)**2*(p1[1]-p0[1]) + 6*(1-t)*t*(p2[1]-p1[1]) + 3*t**2*(p3[1]-p2[1])
    return math.degrees(math.atan2(dy, dx))

def bez_d(p0, p1, p2, p3):
    return f"M {p0[0]:.1f},{p0[1]:.1f} C {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f}"

def leaf_group(x, y, angle_deg, length, width, stroke, stroke_width=2.4, vein=True):
    c1 = (length*0.22, -width*0.62)
    c2 = (length*0.58, -width*0.5)
    c3 = (length*0.58,  width*0.5)
    c4 = (length*0.22,  width*0.62)
    d = (f"M 0,0 C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {length:.1f},0 "
         f"C {c3[0]:.1f},{c3[1]:.1f} {c4[0]:.1f},{c4[1]:.1f} 0,0 Z")
    parts = [f'<g transform="translate({x:.1f},{y:.1f}) rotate({angle_deg:.1f})">']
    parts.append(f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{stroke_width}" stroke-linejoin="round"/>')
    if vein:
        vy = width*0.06
        parts.append(f'<path d="M {length*0.05:.1f},0 Q {length*0.5:.1f},{vy:.1f} {length*0.88:.1f},0" '
                      f'fill="none" stroke="{stroke}" stroke-width="{stroke_width*0.55}"/>')
        # a few side veins for engraved texture
        for f in (0.35, 0.55, 0.72):
            lx = length*f
            parts.append(f'<path d="M {lx:.1f},0 L {lx*0.82:.1f},{-width*0.32:.1f}" fill="none" stroke="{stroke}" stroke-width="{stroke_width*0.35}"/>')
            parts.append(f'<path d="M {lx:.1f},0 L {lx*0.82:.1f},{width*0.32:.1f}" fill="none" stroke="{stroke}" stroke-width="{stroke_width*0.35}"/>')
    parts.append("</g>")
    return "".join(parts)

def olive_group(x, y, angle_deg, stalk, rx, ry, stroke, stroke_width=2.2):
    parts = [f'<g transform="translate({x:.1f},{y:.1f}) rotate({angle_deg:.1f})">']
    parts.append(f'<path d="M 0,0 L {stalk:.1f},0" fill="none" stroke="{stroke}" stroke-width="{stroke_width*0.6}"/>')
    cx = stalk + rx
    parts.append(f'<ellipse cx="{cx:.1f}" cy="0" rx="{rx:.1f}" ry="{ry:.1f}" fill="none" stroke="{stroke}" stroke-width="{stroke_width}"/>')
    parts.append(f'<path d="M {cx-rx*0.5:.1f},{-ry*0.35:.1f} Q {cx:.1f},{-ry*0.6:.1f} {cx+rx*0.5:.1f},{-ry*0.35:.1f}" '
                  f'fill="none" stroke="{stroke}" stroke-width="{stroke_width*0.4}"/>')
    parts.append("</g>")
    return "".join(parts)

def sprig(stem_pts, t_leaves, base_len, base_width, line, accent, accent_t=None,
          olives=None, stroke_width=2.4, taper_end=0.6):
    p0, p1, p2, p3 = stem_pts
    els = [f'<path d="{bez_d(p0,p1,p2,p3)}" fill="none" stroke="{line}" stroke-width="{stroke_width*1.15}"/>']
    for i, t in enumerate(t_leaves):
        x, y = bez_point(p0, p1, p2, p3, t)
        tan = bez_tangent_deg(p0, p1, p2, p3, t)
        side = 1 if i % 2 == 0 else -1
        splay = 52 - 18*t
        length = base_len * (1 - taper_end*t)
        width = base_width * (1 - taper_end*t)
        col = accent if (accent_t is not None and t == accent_t) else line
        els.append(leaf_group(x, y, tan + side*splay, max(length, 26), max(width, 9), col, stroke_width))
    if olives:
        for t, side, rx, ry in olives:
            x, y = bez_point(p0, p1, p2, p3, t)
            tan = bez_tangent_deg(p0, p1, p2, p3, t)
            els.append(olive_group(x, y, tan + side*100, 62, rx, ry, line, stroke_width))
    return "".join(els)

def svg_wrap(vb_w, vb_h, out_w, out_h, ground, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{out_w}" height="{out_h}" '
            f'viewBox="0 0 {vb_w} {vb_h}">'
            f'<rect width="{vb_w}" height="{vb_h}" fill="{ground}"/>'
            f'{body}</svg>')

# ---------- SINGLE-SPRIG EMBLEM ----------
def build_single_sprig(c):
    p0, p1, p2, p3 = (500, 1240), (430, 900), (610, 480), (515, 110)
    t_leaves = [0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.86]
    body = sprig((p0, p1, p2, p3), t_leaves, base_len=185, base_width=62,
                 line=c["line"], accent=c["accent"], accent_t=0.86,
                 olives=[(0.19, 1, 22, 31), (0.49, -1, 19, 26)], stroke_width=3.0)
    return svg_wrap(1000, 1300, 2000, 2600, c["ground"], body)

# ---------- DENSE FIELD (hero panel, main stem + 2 side branches) ----------
def build_dense_field(c):
    main = ((700, 1350), (620, 950), (820, 520), (700, 90))
    t_leaves_main = [0.12, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
    body = sprig(main, t_leaves_main, base_len=150, base_width=50,
                 line=c["line"], accent=c["accent"], accent_t=0.90,
                 olives=[(0.16, 1, 20, 28), (0.45, -1, 19, 26), (0.75, 1, 17, 23)],
                 stroke_width=2.8)
    # left branch forking at t=0.42
    p0, p1, p2, p3 = main
    fx, fy = bez_point(p0, p1, p2, p3, 0.42)
    ftan = bez_tangent_deg(p0, p1, p2, p3, 0.42)
    ang = math.radians(ftan - 140)
    lp0 = (fx, fy)
    lp3 = (fx + 430*math.cos(ang), fy + 430*math.sin(ang))
    lp1 = (fx + 150*math.cos(ang-0.3), fy + 150*math.sin(ang-0.3))
    lp2 = (fx + 320*math.cos(ang+0.15), fy + 320*math.sin(ang+0.15))
    body += sprig((lp0, lp1, lp2, lp3), [0.2, 0.4, 0.6, 0.8], base_len=95, base_width=34,
                  line=c["line"], accent=c["accent"], accent_t=None, stroke_width=2.4, taper_end=0.5)
    # right branch forking at t=0.62
    fx2, fy2 = bez_point(p0, p1, p2, p3, 0.62)
    ftan2 = bez_tangent_deg(p0, p1, p2, p3, 0.62)
    ang2 = math.radians(ftan2 + 145)
    rp0 = (fx2, fy2)
    rp3 = (fx2 + 400*math.cos(ang2), fy2 + 400*math.sin(ang2))
    rp1 = (fx2 + 140*math.cos(ang2+0.3), fy2 + 140*math.sin(ang2+0.3))
    rp2 = (fx2 + 300*math.cos(ang2-0.15), fy2 + 300*math.sin(ang2-0.15))
    body += sprig((rp0, rp1, rp2, rp3), [0.2, 0.4, 0.6, 0.8], base_len=90, base_width=32,
                  line=c["line"], accent=c["accent"], accent_t=None, stroke_width=2.4, taper_end=0.5)
    return svg_wrap(1400, 1400, 2400, 2400, c["ground"], body)

# ---------- HAIRLINE BORDER (wide tileable strip) ----------
def build_hairline_border(c):
    unit_w = 400
    n = 8
    total_w = unit_w * n
    body = []
    y0 = 200
    for i in range(n):
        x0 = i * unit_w
        p0 = (x0, y0)
        p1 = (x0 + unit_w*0.25, y0 - 55)
        p2 = (x0 + unit_w*0.75, y0 + 55)
        p3 = (x0 + unit_w, y0)
        body.append(f'<path d="{bez_d(p0,p1,p2,p3)}" fill="none" stroke="{c["line"]}" stroke-width="2.2"/>')
        body.append(f'<path d="{bez_d((p0[0],p0[1]+6),(p1[0],p1[1]+6),(p2[0],p2[1]+6),(p3[0],p3[1]+6))}" '
                     f'fill="none" stroke="{c["line"]}" stroke-width="1.1"/>')
        t = 0.5
        x, y = bez_point(p0, p1, p2, p3, t)
        tan = bez_tangent_deg(p0, p1, p2, p3, t)
        is_accent = (i % 4 == 2)
        col = c["accent"] if is_accent else c["line"]
        body.append(leaf_group(x, y, tan - 55, 60, 22, col, 1.8))
        body.append(leaf_group(x, y, tan + 235, 60, 22, c["line"], 1.8))
    return svg_wrap(total_w, 400, total_w*1.5, 600, c["ground"], "".join(body))

BUILDERS = {
    "single-sprig": build_single_sprig,
    "dense-field": build_dense_field,
    "hairline-border": build_hairline_border,
}

for motif, fn in BUILDERS.items():
    for cw_name, cw in COLORWAYS.items():
        svg = fn(cw)
        path = f"{OUT}/{motif}--{cw_name}.svg"
        with open(path, "w") as f:
            f.write(svg)
        print("wrote", path)
