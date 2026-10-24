extends Node3D

const CARD_W := 0.72
const CARD_H := 1.05
const SUITS := ["♠", "♥", "♦", "♣"]
const RANKS := ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]

var selected_card := -1
var hand_nodes: Array[Node3D] = []
var status_label: Label3D
var card_faces: Array[String] = ["A♠", "K♥", "10♣", "Q♦"]

func _ready() -> void:
    _build_lighting()
    _build_camera()
    _build_table()
    _build_seats()
    _build_center_mark()
    _build_hud()
    _build_hand()
    _animate_intro()

func _material(color: Color, metallic: float = 0.0, roughness: float = 0.6) -> StandardMaterial3D:
    var m := StandardMaterial3D.new()
    m.albedo_color = color
    m.metallic = metallic
    m.roughness = roughness
    return m

func _build_lighting() -> void:
    var world := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_SKY
    env.sky = Sky.new()
    env.sky.sky_material = ProceduralSkyMaterial.new()
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color(0.28, 0.36, 0.29)
    env.ambient_light_energy = 0.55
    env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
    world.environment = env
    add_child(world)

    var key := DirectionalLight3D.new()
    key.rotation_degrees = Vector3(-52, -28, 0)
    key.light_color = Color(1.0, 0.84, 0.59)
    key.light_energy = 1.35
    key.shadow_enabled = true
    add_child(key)

    var fill := OmniLight3D.new()
    fill.position = Vector3(-3.2, 4.0, 1.0)
    fill.light_color = Color(0.28, 0.68, 0.46)
    fill.light_energy = 2.0
    fill.omni_range = 10.0
    add_child(fill)

    var rim := OmniLight3D.new()
    rim.position = Vector3(3.5, 3.2, -3.5)
    rim.light_color = Color(0.88, 0.61, 0.27)
    rim.light_energy = 2.4
    rim.omni_range = 9.0
    add_child(rim)

func _build_camera() -> void:
    var camera := Camera3D.new()
    camera.position = Vector3(0, 10.8, 12.5)
    camera.fov = 39
    camera.current = true
    add_child(camera)
    camera.look_at(Vector3(0, 0.1, 0), Vector3.UP)

func _build_table() -> void:
    var shadow_base := MeshInstance3D.new()
    var base_mesh := CylinderMesh.new()
    base_mesh.top_radius = 5.2
    base_mesh.bottom_radius = 5.2
    base_mesh.height = 0.62
    base_mesh.radial_segments = 128
    shadow_base.mesh = base_mesh
    shadow_base.scale.x = 1.22
    shadow_base.position.y = -0.35
    shadow_base.material_override = _material(Color("#33251a"), 0.25, 0.29)
    add_child(shadow_base)

    var trim := MeshInstance3D.new()
    var trim_mesh := CylinderMesh.new()
    trim_mesh.top_radius = 5.18
    trim_mesh.bottom_radius = 5.18
    trim_mesh.height = 0.16
    trim_mesh.radial_segments = 128
    trim.mesh = trim_mesh
    trim.scale.x = 1.22
    trim.position.y = -0.04
    trim.material_override = _material(Color("#c7a45b"), 0.72, 0.25)
    add_child(trim)

    var felt := MeshInstance3D.new()
    var felt_mesh := CylinderMesh.new()
    felt_mesh.top_radius = 5.08
    felt_mesh.bottom_radius = 5.08
    felt_mesh.height = 0.14
    felt_mesh.radial_segments = 128
    felt.mesh = felt_mesh
    felt.scale.x = 1.22
    felt.position.y = 0.07
    felt.material_override = _material(Color("#155238"), 0.02, 0.92)
    add_child(felt)

    # A thin gold inner ring gives the table a crafted, premium edge.
    var ring := MeshInstance3D.new()
    var ring_mesh := TorusMesh.new()
    ring_mesh.inner_radius = 4.63
    ring_mesh.outer_radius = 4.67
    ring_mesh.rings = 8
    ring_mesh.ring_segments = 128
    ring.mesh = ring_mesh
    ring.scale.x = 1.22
    ring.position.y = 0.145
    ring.material_override = _material(Color("#d8b56b"), 0.68, 0.32)
    add_child(ring)

func _label(text: String, pos: Vector3, size: float, color: Color = Color("#f6edda")) -> Label3D:
    var label := Label3D.new()
    label.text = text
    label.position = pos
    label.font_size = int(size * 100)
    label.pixel_size = 0.0018
    label.modulate = color
    label.billboard = BaseMaterial3D.BILLBOARD_DISABLED
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    add_child(label)
    return label

func _build_seats() -> void:
    _seat("حریف", Vector3(0, 0.24, -3.5), Vector3(0, 0, 0))
    _seat("هم‌تیمی", Vector3(-3.15, 0.24, -0.1), Vector3(0, 90, 0))
    _seat("حریف", Vector3(3.15, 0.24, -0.1), Vector3(0, -90, 0))
    _label("چهاربرگ", Vector3(0, 0.23, -1.25), 0.24, Color("#d8b56b"))

func _seat(title: String, pos: Vector3, rot: Vector3) -> void:
    var root := Node3D.new()
    root.position = pos
    root.rotation_degrees = rot
    add_child(root)

    var pedestal := MeshInstance3D.new()
    var mesh := CylinderMesh.new()
    mesh.top_radius = 0.43
    mesh.bottom_radius = 0.5
    mesh.height = 0.12
    pedestal.mesh = mesh
    pedestal.material_override = _material(Color("#c9a45c"), 0.45, 0.32)
    root.add_child(pedestal)

    var avatar := MeshInstance3D.new()
    var sphere := SphereMesh.new()
    sphere.radius = 0.34
    sphere.height = 0.68
    avatar.mesh = sphere
    avatar.position.y = 0.43
    avatar.material_override = _material(Color("#1b3026"), 0.1, 0.4)
    root.add_child(avatar)

    var face := MeshInstance3D.new()
    var face_mesh := SphereMesh.new()
    face_mesh.radius = 0.19
    face_mesh.height = 0.38
    face.mesh = face_mesh
    face.position = Vector3(0, 0.46, 0.17)
    face.material_override = _material(Color("#d5b28a"), 0.0, 0.8)
    root.add_child(face)

    var name := Label3D.new()
    name.text = title
    name.position = Vector3(0, 1.0, 0)
    name.font_size = 48
    name.pixel_size = 0.006
    name.modulate = Color("#f2e7ce")
    name.billboard = BaseMaterial3D.BILLBOARD_ENABLED
    root.add_child(name)

    for i in range(5):
        var back := _card_back()
        back.position = Vector3((i - 2) * 0.19, 0.24, 0.58)
        back.rotation_degrees.x = -12
        root.add_child(back)

func _card_back() -> Node3D:
    var root := Node3D.new()
    var face := MeshInstance3D.new()
    var mesh := BoxMesh.new()
    mesh.size = Vector3(CARD_W, 0.045, CARD_H)
    face.mesh = mesh
    face.material_override = _material(Color("#f5eedb"), 0.0, 0.38)
    root.add_child(face)

    var inset := MeshInstance3D.new()
    var inset_mesh := BoxMesh.new()
    inset_mesh.size = Vector3(CARD_W - 0.08, 0.012, CARD_H - 0.08)
    inset.mesh = inset_mesh
    inset.position.y = 0.028
    inset.material_override = _material(Color("#173d2b"), 0.15, 0.42)
    root.add_child(inset)

    var sigil := Label3D.new()
    sigil.text = "۴"
    sigil.position.y = 0.04
    sigil.font_size = 72
    sigil.pixel_size = 0.004
    sigil.modulate = Color("#e1c27a")
    sigil.rotation_degrees.x = -90
    root.add_child(sigil)
    return root

func _build_center_mark() -> void:
    var emblem := MeshInstance3D.new()
    var mesh := TorusMesh.new()
    mesh.inner_radius = 0.56
    mesh.outer_radius = 0.59
    mesh.rings = 8
    mesh.ring_segments = 64
    emblem.mesh = mesh
    emblem.position = Vector3(0, 0.17, 0)
    emblem.material_override = _material(Color("#d8b56b"), 0.75, 0.3)
    add_child(emblem)
    _label("چهاربرگ", Vector3(0, 0.19, 0), 0.19, Color("#f2d18a"))

func _build_hud() -> void:
    status_label = _label("چهار کارت آغازین  •  برای بازی یکی را لمس کن", Vector3(0, 0.2, 2.05), 0.15, Color("#f7e8c8"))
    _label("تیم شما", Vector3(0, 0.22, 4.45), 0.17, Color("#e4c47b"))

func _build_hand() -> void:
    for i in range(card_faces.size()):
        var card := _card_front(card_faces[i], i)
        var offset := float(i) - float(card_faces.size() - 1) * 0.5
        card.position = Vector3(offset * 0.88, 0.24, 3.48 + abs(offset) * 0.045)
        card.rotation_degrees.x = -8
        card.rotation_degrees.y = offset * 2.0
        add_child(card)
        hand_nodes.append(card)

func _card_front(text: String, index: int) -> Node3D:
    var root := Node3D.new()
    root.set_meta("card_index", index)

    var body := MeshInstance3D.new()
    var mesh := BoxMesh.new()
    mesh.size = Vector3(CARD_W, 0.07, CARD_H)
    body.mesh = mesh
    body.material_override = _material(Color("#fffaf0"), 0.0, 0.27)
    root.add_child(body)

    var inner := MeshInstance3D.new()
    var inner_mesh := BoxMesh.new()
    inner_mesh.size = Vector3(CARD_W - 0.08, 0.012, CARD_H - 0.08)
    inner.mesh = inner_mesh
    inner.position.y = 0.041
    inner.material_override = _material(Color("#f3ead7"), 0.0, 0.5)
    root.add_child(inner)

    var red := text.contains("♥") or text.contains("♦")
    var ink := Color("#b93d3d") if red else Color("#172b21")
    var label := Label3D.new()
    label.text = text
    label.position = Vector3(0, 0.052, 0)
    label.font_size = 82
    label.pixel_size = 0.0042
    label.modulate = ink
    label.rotation_degrees.x = -90
    root.add_child(label)

    var corner := Label3D.new()
    corner.text = text
    corner.position = Vector3(-0.22, 0.054, -0.39)
    corner.font_size = 25
    corner.pixel_size = 0.003
    corner.modulate = ink
    corner.rotation_degrees.x = -90
    root.add_child(corner)

    var area := Area3D.new()
    var collision := CollisionShape3D.new()
    var shape := BoxShape3D.new()
    shape.size = Vector3(CARD_W, 0.12, CARD_H)
    collision.shape = shape
    area.add_child(collision)
    area.input_ray_pickable = true
    area.input_event.connect(_on_card_input.bind(root, index))
    root.add_child(area)
    return root

func _on_card_input(_camera: Node, event: InputEvent, _position: Vector3, _normal: Vector3, _shape_idx: int, card: Node3D, index: int) -> void:
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        _play_card(card, index)
    elif event is InputEventScreenTouch and event.pressed:
        _play_card(card, index)

func _play_card(card: Node3D, index: int) -> void:
    if not is_instance_valid(card) or card.get_meta("played", false):
        return
    card.set_meta("played", true)
    var tween := create_tween()
    tween.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    tween.tween_property(card, "position", Vector3(0, 0.42, 0.85), 0.42)
    tween.parallel().tween_property(card, "rotation_degrees", Vector3(-8, 0, 0), 0.42)
    tween.tween_property(card, "scale", Vector3(0.92, 0.92, 0.92), 0.18)
    status_label.text = "کارت %s بازی شد  •  پیش‌نمایش تعاملی" % card_faces[index]
    await tween.finished
    card.visible = false

func _animate_intro() -> void:
    var camera := get_viewport().get_camera_3d()
    if camera:
        var start := camera.position + Vector3(0, 1.2, 1.2)
        camera.position = start
        var tween := create_tween()
        tween.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
        tween.tween_property(camera, "position", Vector3(0, 10.8, 12.5), 1.15)
