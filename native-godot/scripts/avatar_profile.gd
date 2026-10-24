extends Control
## First-pass modular avatar profile model.
## This data model is intentionally separate from account storage until the FourBarg
## Supabase project and authenticated profile flow are configured.

signal appearance_changed(profile: Dictionary)

const DEFAULT_PROFILE := {
    "body_style": "classic",
    "skin_tone": 0,
    "hair_style": 0,
    "hair_color": 0,
    "outfit": 0,
    "accessory": 0
}

const SKIN_TONES := [Color("#f1d2b3"), Color("#d7ae88"), Color("#b98162"), Color("#80513e"), Color("#57382e")]
const HAIR_COLORS := [Color("#29211e"), Color("#5a3928"), Color("#b18a4f"), Color("#777777"), Color("#ded4bd")]
const OUTFIT_COLORS := [Color("#426b88"), Color("#6c4b78"), Color("#8a623e"), Color("#315b45"), Color("#293447"), Color("#8a3540")]

var profile: Dictionary = DEFAULT_PROFILE.duplicate(true)

func set_option(option_name: String, option_value: Variant) -> void:
    if not profile.has(option_name):
        push_warning("Unknown avatar option: %s" % option_name)
        return
    profile[option_name] = option_value
    appearance_changed.emit(profile.duplicate(true))

func get_skin_color() -> Color:
    return SKIN_TONES[clampi(int(profile.get("skin_tone", 0)), 0, SKIN_TONES.size() - 1)]

func get_hair_color() -> Color:
    return HAIR_COLORS[clampi(int(profile.get("hair_color", 0)), 0, HAIR_COLORS.size() - 1)]

func get_outfit_color() -> Color:
    return OUTFIT_COLORS[clampi(int(profile.get("outfit", 0)), 0, OUTFIT_COLORS.size() - 1)]

func export_profile_json() -> String:
    return JSON.stringify(profile)

func import_profile_json(raw_json: String) -> bool:
    var parsed: Variant = JSON.parse_string(raw_json)
    if typeof(parsed) != TYPE_DICTIONARY:
        return false
    for key in DEFAULT_PROFILE:
        if parsed.has(key):
            profile[key] = parsed[key]
    appearance_changed.emit(profile.duplicate(true))
    return true
