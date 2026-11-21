"""Dựng nhân vật chibi 'Tài' trong Blender (chạy headless bằng bpy), xuất tai.glb.
Mặt hướng -Y (glTF sẽ thành +Z). Các khớp: head, armL, armR, legL, legR là empty để game xoay."""
import bpy, bmesh, math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c)

MATS = {}
def mat(name, hexc):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*lin(hexc), 1); b.inputs['Roughness'].default_value = .85
    MATS[name] = m; return m

C = dict(skin='#fbe3cf', hair='#2e231f', hair2='#4a372d', coat='#dcd5cc', lapel='#f3eee7', inner='#29242a', pants='#d4cec7',
         shoe='#f6f4f0', sole='#8a847c', eye='#3a281e', iris='#8a6448', white='#ffffff', line='#1c1517', blush='#f7c3c6',
         glass='#1d1a1e', button='#7a6a5a', mouth='#a4505c', brow='#2e231f')

def finish(ob, m, smooth=True, sub=0, parent=None):
    ob.data.materials.clear(); ob.data.materials.append(mat(m, C[m]))
    if smooth:
        for p in ob.data.polygons: p.use_smooth = True
    if sub:
        mod = ob.modifiers.new('sub', 'SUBSURF'); mod.levels = sub; mod.render_levels = sub
    if parent: ob.parent = parent; ob.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob

def sphere(name, r, loc, scale=(1, 1, 1), m='skin', seg=24, ring=14, sub=0, parent=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=r, location=loc, rotation=rot)
    ob = bpy.context.object; ob.name = name; ob.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(ob, m, sub=sub, parent=parent)

def cyl(name, r, depth, loc, m, r2=None, seg=20, rot=(0, 0, 0), caps=True, sub=0, parent=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=depth, location=loc, rotation=rot, end_fill_type='NGON' if caps else 'NOTHING')
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot, end_fill_type='NGON' if caps else 'NOTHING')
    ob = bpy.context.object; ob.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(ob, m, sub=sub, parent=parent)

def tube(name, pts, radii, m, bevel=.05, parent=None, res=7):
    """lọn tóc / đường mảnh: đường cong Bezier có bán kính thay đổi (thon nhọn ở đầu)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = bevel; cu.bevel_resolution = 4
    cu.resolution_u = res; cu.use_fill_caps = True; cu.bevel_resolution = 2
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p, r in zip(sp.bezier_points, pts, radii):
        bp.co = Vector(p); bp.handle_left_type = bp.handle_right_type = 'AUTO'; bp.radius = r
    ob = bpy.data.objects.new(name, cu); S.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    for o in S.objects:
        if o is not ob: o.select_set(False)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.object
    return finish(ob, m, parent=parent)

def joint(name, loc, parent=None):
    e = bpy.data.objects.new(name, None); e.location = loc; S.collection.objects.link(e)
    if parent: e.parent = parent; e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e

root = joint('tai', (0, 0, 0))
HC = Vector((0, 0, 1.32))           # tâm đầu
head = joint('head', (0, 0, .95), root)
legL = joint('legL', (.11, 0, .36), root); legR = joint('legR', (-.11, 0, .36), root)
armL = joint('armL', (.3, 0, .84), root); armR = joint('armR', (-.3, 0, .84), root)

# ---------- chân & giày ----------
for j, sx in ((legL, 1), (legR, -1)):
    cyl('leg', .085, .32, (sx * .11, 0, .2), 'pants', r2=.08, sub=1, parent=j)
    sphere('shoe', .11, (sx * .11, -.035, .055), (1, 1.42, .62), 'shoe', sub=1, parent=j)
    sphere('sole', .105, (sx * .11, -.035, .022), (1.02, 1.45, .22), 'sole', parent=j)

# ---------- thân: áo len cổ lọ + khăn ----------
cyl('sweater', .225, .4, (0, 0, .64), 'inner', r2=.2, sub=1, parent=root)
cyl('turtleneck', .135, .16, (0, 0, .9), 'inner', r2=.125, sub=1, parent=root)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -.215, .6)); sc = bpy.context.object; sc.scale = (.15, .035, .5)
bpy.ops.object.transform_apply(scale=True); bev = sc.modifiers.new('b', 'BEVEL'); bev.width = .02; bev.segments = 3
finish(sc, 'inner', parent=root)

# ---------- áo khoác dạ: hình chữ A, mở vạt phía trước ----------
bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=.335, radius2=.255, depth=.62, location=(0, 0, .56), end_fill_type='NOTHING')
coat = bpy.context.object; coat.name = 'coat'
bm = bmesh.new(); bm.from_mesh(coat.data)
for f in [f for f in bm.faces if f.calc_center_median().y < -.18 and abs(f.calc_center_median().x) < .085 + (.56 + .31 - (f.calc_center_median().z + .56)) * 0]:
    bm.faces.remove(f)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
bm.to_mesh(coat.data); bm.free()
sol = coat.modifiers.new('s', 'SOLIDIFY'); sol.thickness = .025; sol.offset = 1
finish(coat, 'coat', sub=1, parent=root)
sphere('shoulders', .258, (0, 0, .855), (1.0, .98, .36), 'coat', sub=1, parent=root)
for sx in (1, -1):   # ve áo
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * .1, -.27, .74)); lp = bpy.context.object
    lp.scale = (.075, .02, .26); lp.rotation_euler = (0, sx * .42, 0); bpy.ops.object.transform_apply(rotation=True, scale=True)
    b = lp.modifiers.new('b', 'BEVEL'); b.width = .015; b.segments = 2; finish(lp, 'lapel', parent=root)
    for z in (.62, .46): sphere('button', .022, (sx * .12, -.3, z), m='button', parent=root)

# ---------- tay ----------
for j, sx in ((armL, 1), (armR, -1)):
    sphere('arm', .085, (sx * .305, 0, .68), (1, 1, 2.05), 'coat', rot=(0, sx * .13, 0), sub=1, parent=j)
    cyl('cuff', .085, .05, (sx * .33, 0, .52), 'lapel', rot=(0, sx * .13, 0), parent=j)
    sphere('hand', .07, (sx * .335, 0, .465), m='skin', sub=1, parent=j)

# ---------- đầu & mặt ----------
sphere('headball', .5, HC, (1, .95, .95), 'skin', seg=32, ring=20, sub=1, parent=head)
for sx in (1, -1): sphere('ear', .085, (sx * .48, .02, 1.28), (.6, 1, 1), 'skin', parent=head)
FY = -.455   # mặt trước (y)
for sx in (1, -1):
    ex, ez = sx * .17, 1.24
    rot = (0, 0, math.radians(sx * -20))
    sphere('eye', .085, (ex, FY + .012, ez), (.86, .28, 1.12), 'eye', rot=rot, parent=head)
    sphere('iris', .055, (ex, FY - .01, ez - .03), (.86, .2, .9), 'iris', rot=rot, parent=head)
    sphere('hl1', .025, (ex - sx * .022 - .012, FY - .03, ez + .045), (1, .4, 1), 'white', parent=head)
    sphere('hl2', .012, (ex + .03, FY - .028, ez - .055), (1, .4, 1), 'white', parent=head)
    tube('lid', [(ex - .1, FY + .03, ez + .07), (ex, FY - .015, ez + .115), (ex + .1, FY + .03, ez + .075)], [1, 1.1, .7], 'line', bevel=.014, parent=head)
    tube('brow', [(ex - .08, FY + .03, ez + .2), (ex, FY - .002, ez + .225), (ex + .08, FY + .03, ez + .205)], [.6, 1, .5], 'brow', bevel=.012, parent=head)
    sphere('blush', .06, (sx * .27, FY + .07, 1.13), (1.3, .25, .55), 'blush', rot=(0, 0, math.radians(sx * 28)), parent=head)
tube('mouth', [(-.035, FY + .015, 1.075), (0, FY + .005, 1.065), (.035, FY + .015, 1.077)], [.7, 1, .7], 'mouth', bevel=.01, parent=head)

# kính gọng tròn mảnh
for sx in (1, -1):
    bpy.ops.mesh.primitive_torus_add(major_radius=.135, minor_radius=.012, major_segments=40, minor_segments=8,
                                     location=(sx * .175, FY - .06, 1.245), rotation=(math.radians(90), 0, math.radians(sx * 14)))
    finish(bpy.context.object, 'glass', parent=head)
    tube('temple', [(sx * .31, FY - .02, 1.27), (sx * .43, -.2, 1.29), (sx * .46, .05, 1.28)], [1, 1, 1], 'glass', bevel=.011, parent=head)
tube('bridge', [(-.045, FY - .07, 1.27), (0, FY - .085, 1.285), (.045, FY - .07, 1.27)], [1, 1, 1], 'glass', bevel=.011, parent=head)

# ---------- tóc ----------
bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=22, radius=.535, location=HC + Vector((0, .03, .03)))
cap = bpy.context.object; cap.scale = (1.03, 1.0, .98); bpy.ops.object.transform_apply(scale=True)
bm = bmesh.new(); bm.from_mesh(cap.data)
kill = []
for v in bm.verts:
    p = v.co + cap.location
    if (p.y < -.12 and p.z < 1.52) or (p.y < -.3 and p.z < 1.62) or p.z < .98 or (abs(p.x) > .38 and p.z < 1.33 and p.y < .1):
        kill.append(v)
bmesh.ops.delete(bm, geom=kill, context='VERTS'); bm.to_mesh(cap.data); bm.free()
sol = cap.modifiers.new('s', 'SOLIDIFY'); sol.thickness = .03
finish(cap, 'hair', sub=1, parent=head)
# mái: rẽ ngôi bên trái người xem, vuốt sang phải và rủ xuống trán
F = [  # (điểm), bán kính
    ([(-.2, -.2, 1.84), (-.12, -.46, 1.66), (.06, -.55, 1.5), (.2, -.54, 1.4)], [1.5, 1.6, 1.1, .1]),
    ([(-.28, -.12, 1.8), (-.26, -.44, 1.62), (-.16, -.55, 1.47), (-.08, -.55, 1.38)], [1.3, 1.4, 1, .1]),
    ([(-.1, -.12, 1.86), (.05, -.42, 1.7), (.22, -.52, 1.55), (.34, -.47, 1.42)], [1.5, 1.5, 1, .1]),
    ([(.0, -.05, 1.88), (.2, -.32, 1.78), (.36, -.45, 1.6), (.44, -.4, 1.45)], [1.4, 1.4, 1, .1]),
    ([(-.36, -.1, 1.72), (-.44, -.34, 1.52), (-.42, -.44, 1.36)], [1.2, 1, .1]),
    ([(.1, .05, 1.9), (.32, -.12, 1.84), (.5, -.22, 1.66), (.56, -.2, 1.5)], [1.4, 1.3, .9, .1]),
    ([(-.15, .1, 1.88), (.1, .02, 1.95), (.3, -.06, 1.92), (.42, -.1, 1.85)], [1.5, 1.5, 1, .1]),   # khối phồng đỉnh đầu
    ([(.3, -.05, 1.84), (.5, -.08, 1.8), (.62, -.12, 1.84), (.66, -.14, 1.92)], [1, .8, .5, .1]),     # lọn vểnh bên phải
]
for i, (pts, rr) in enumerate(F):
    tube('lock%d' % i, pts, rr, 'hair' if i % 3 else 'hair2', bevel=.06, parent=head)
for sx in (1, -1):   # tóc mai
    tube('side', [(sx * .44, -.12, 1.5), (sx * .5, -.18, 1.3), (sx * .48, -.2, 1.14)], [1.4, 1.1, .1], 'hair', bevel=.05, parent=head)
for k in range(5):   # tóc sau gáy
    a = math.radians(-60 + k * 30)
    tube('back', [(math.sin(a) * .4, .35 + math.cos(a) * .05, 1.5), (math.sin(a) * .46, .42, 1.25), (math.sin(a) * .4, .36, 1.05)], [1.4, 1.2, .2], 'hair', bevel=.06, parent=head)

# ---------- xuất ----------
for o in S.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath='/home/claude/avatar/tai_blender.glb', export_format='GLB', export_apply=True, export_yup=True,
                          export_materials='EXPORT', use_selection=False, export_extras=False)
tri = 0
dg = bpy.context.evaluated_depsgraph_get()
for o in S.objects:
    if o.type == 'MESH':
        me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tri += len(me.loop_triangles); o.evaluated_get(dg).to_mesh_clear()
print('TRIS', tri)
