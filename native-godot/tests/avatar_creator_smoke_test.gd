extends SceneTree
## Headless smoke test for the avatar editor scene and local profile persistence.

const AvatarScene = preload("res://scenes/avatar_creator.tscn")
const SAVE_PATH := "user://fourbarg_avatar.json"

func _initialize() -> void:
    call_deferred("_run_test")

func _run_test() -> void:
    var avatar = AvatarScene.instantiate()
    root.add_child(avatar)
    await process_frame

    assert(avatar.profile is Dictionary, "Avatar editor must expose a profile dictionary.")
    avatar._choose("skin_tone", 2)
    avatar._choose("outfit", 3)
    avatar._save_profile()

    assert(FileAccess.file_exists(SAVE_PATH), "Saving the avatar must create a local JSON file.")
    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    assert(file != null, "Saved avatar profile must be readable.")
    var parsed = JSON.parse_string(file.get_as_text())
    file.close()
    assert(parsed is Dictionary, "Saved avatar profile must be valid JSON object.")
    assert(int(parsed.get("skin_tone", -1)) == 2, "Skin tone choice must persist.")
    assert(int(parsed.get("outfit", -1)) == 3, "Outfit choice must persist.")

    avatar.queue_free()
    print("PASS: avatar editor scene loads and profile options persist as JSON.")
    quit(0)
