extends Control
## Touch-first modular avatar editor for FourBarg.
## This scene is a prototype UI; save data locally until account persistence is implemented.

signal avatar_saved(profile: Dictionary)
signal back_requested

const SAVE_PATH := "user://fourbarg_avatar.json"
const SKIN_TONES := [Color("#f1c7a5"), Color("#d99b72"), Color("#a96d4b"), Color("#70442f")]
const HAIR_COLORS := [Color("#241914"), Color("#5a3827"), Color("#b98542"), Color("#d8d0c4")]
const OUTFIT_COLORS := [Color("#183a32"), Color("#253b66"), Color("#762f3b"), Color("#292b35"), Color("#b68b45")]

var profile := {
	"body_style": 0,
	"skin_tone": 0,
	"hair_style": 0,
	"hair_color": 0,
	"outfit": 0,
	"accessory": 0
}
var preview_root: Node3D
var preview_parts: Dictionary = {}
var status_label: Label

func _ready() -> void:
	_build_ui()
	_load_profile()
	_build_preview()
	_refresh_preview()

func _build_ui() -> void:
	var background := ColorRect.new()
	background.color = Color("#101923")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var scroll := ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.offset_bottom = -12
	add_child(scroll)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 14)
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	column.add_theme_constant_override("margin_left", 20)
	scroll.add_child(column)

	var heading := Label.new()
	heading.text = "ساخت کاراکتر"
	heading.add_theme_font_size_override("font_size", 30)
	heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(heading)

	var preview := SubViewportContainer.new()
	preview.custom_minimum_size = Vector2(0, 340)
	preview.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	column.add_child(preview)
	var viewport := SubViewport.new()
	viewport.size = Vector2i(640, 480)
	viewport.transparent_bg = false
	preview.add_child(viewport)
	preview_root = Node3D.new()
	viewport.add_child(preview_root)
	var camera := Camera3D.new()
	camera.position = Vector3(0, 1.55, 4.4)
	camera.look_at(Vector3(0, 1.25, 0))
	preview_root.add_child(camera)
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-25, -25, 0)
	preview_root.add_child(light)
	var world := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("#d6dbe3")
	env.ambient_light_energy = 0.7
	world.environment = env
	preview_root.add_child(world)

	_add_picker(column, "فرم بدن", "body_style", ["متوسط", "باریک", "درشت"])
	_add_picker(column, "رنگ پوست", "skin_tone", ["روشن", "گندمی", "سبزه", "تیره"])
	_add_picker(column, "مدل مو", "hair_style", ["کوتاه", "بلند", "فرفری", "بدون مو"])
	_add_picker(column, "رنگ مو", "hair_color", ["مشکی", "قهوه‌ای", "طلایی", "خاکستری"])
	_add_picker(column, "لباس", "outfit", ["سبز", "آبی", "زرشکی", "ذغالی", "طلایی"])
	_add_picker(column, "اکسسوری", "accessory", ["هیچ‌کدام", "عینک", "گردنبند"])

	var save_button := Button.new()
	save_button.text = "ذخیره ظاهر"
	save_button.custom_minimum_size = Vector2(0, 54)
	save_button.pressed.connect(_save_profile)
	column.add_child(save_button)
	var back_button := Button.new()
	back_button.text = "بازگشت به میز"
	back_button.custom_minimum_size = Vector2(0, 50)
	back_button.pressed.connect(func(): back_requested.emit())
	column.add_child(back_button)
	status_label = Label.new()
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(status_label)

func _add_picker(parent: VBoxContainer, title: String, key: String, options: Array) -> void:
	var row := VBoxContainer.new()
	row.add_theme_constant_override("separation", 5)
	parent.add_child(row)
	var label := Label.new()
	label.text = title
	row.add_child(label)
	var buttons := HBoxContainer.new()
	buttons.add_theme_constant_override("separation", 6)
	row.add_child(buttons)
	for index in range(options.size()):
		var button := Button.new()
		button.text = str(options[index])
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0, 42)
		button.pressed.connect(func(): _choose(key, index))
		buttons.add_child(button)

func _choose(key: String, value: int) -> void:
	profile[key] = value
	_refresh_preview()

func _build_preview() -> void:
	var floor := MeshInstance3D.new()
	var floor_mesh := PlaneMesh.new()
	floor_mesh.size = Vector2(5, 5)
	floor.mesh = floor_mesh
	var floor_mat := StandardMaterial3D.new()
	floor_mat.albedo_color = Color("#172b2b")
	floor.material_override = floor_mat
	floor.position.y = 0.02
	preview_root.add_child(floor)

	_add_part("body", Vector3(0, 1.05, 0), Vector3(0.58, 0.78, 0.32))
	_add_part("head", Vector3(0, 1.75, 0), Vector3(0.36, 0.42, 0.34))
	_add_part("hair", Vector3(0, 1.98, -0.01), Vector3(0.38, 0.16, 0.36))
	_add_part("left_arm", Vector3(-0.43, 1.12, 0), Vector3(0.16, 0.62, 0.17))
	_add_part("right_arm", Vector3(0.43, 1.12, 0), Vector3(0.16, 0.62, 0.17))
	_add_part("left_leg", Vector3(-0.18, 0.38, 0), Vector3(0.19, 0.58, 0.22))
	_add_part("right_leg", Vector3(0.18, 0.38, 0), Vector3(0.19, 0.58, 0.22))
	_add_part("accessory", Vector3(0, 1.72, 0.29), Vector3(0.42, 0.08, 0.05))

func _add_part(key: String, pos: Vector3, scale_value: Vector3) -> void:
	var part := MeshInstance3D.new()
	var mesh := CapsuleMesh.new()
	mesh.radius = 0.5
	mesh.height = 1.0
	part.mesh = mesh
	part.position = pos
	part.scale = scale_value
	preview_root.add_child(part)
	preview_parts[key] = part

func _refresh_preview() -> void:
	if preview_parts.is_empty():
		return
	_set_color("body", OUTFIT_COLORS[int(profile.outfit) % OUTFIT_COLORS.size()])
	var skin: Color = SKIN_TONES[int(profile.skin_tone) % SKIN_TONES.size()]
	for key in ["head", "left_arm", "right_arm"]:
		_set_color(key, skin)
	_set_color("hair", HAIR_COLORS[int(profile.hair_color) % HAIR_COLORS.size()])
	var body_scale := [1.0, 0.84, 1.18][int(profile.body_style) % 3]
	preview_parts["body"].scale.x = 0.58 * body_scale
	preview_parts["head"].visible = true
	preview_parts["hair"].visible = int(profile.hair_style) != 3
	preview_parts["hair"].scale = Vector3(0.38, 0.16, 0.36)
	if int(profile.hair_style) == 1:
		preview_parts["hair"].scale.y = 0.45
	elif int(profile.hair_style) == 2:
		preview_parts["hair"].scale = Vector3(0.42, 0.22, 0.4)
	preview_parts["accessory"].visible = int(profile.accessory) != 0
	_set_color("accessory", Color("#c9a45c") if int(profile.accessory) == 2 else Color("#cbd3da"))

func _set_color(key: String, color: Color) -> void:
	if not preview_parts.has(key):
		return
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.72
	preview_parts[key].material_override = material

func _save_profile() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		status_label.text = "ذخیره‌سازی انجام نشد."
		return
	file.store_string(JSON.stringify(profile))
	file.close()
	status_label.text = "ظاهر روی همین دستگاه ذخیره شد."
	avatar_saved.emit(profile.duplicate(true))

func _load_profile() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	file.close()
	if parsed is Dictionary:
		for key in profile.keys():
			if parsed.has(key) and parsed[key] is int:
				profile[key] = parsed[key]
