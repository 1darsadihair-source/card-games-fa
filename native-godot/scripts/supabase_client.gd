extends Node
class_name FourBargSupabaseClient

## Configure the URL and publishable key from a dedicated Supabase project.
## A publishable key is intended for clients; never put a secret/service_role key here.
## This client scaffold handles email/password Auth and user-scoped profile reads.
## Server-authoritative match scoring is intentionally not exposed as a client write.

signal auth_succeeded(session: Dictionary)
signal auth_failed(message: String)
signal profile_loaded(profile: Dictionary)
signal request_failed(message: String)

const CONFIG_PATH := "user://fourbarg_supabase.cfg"
const AUTH_BASE := "/auth/v1"
const REST_BASE := "/rest/v1"

var project_url := ""
var publishable_key := ""
var access_token := ""
var refresh_token := ""
var current_user: Dictionary = {}
var _http: HTTPRequest

func _ready() -> void:
    _http = HTTPRequest.new()
    _http.timeout = 20.0
    add_child(_http)
    _http.request_completed.connect(_on_request_completed)
    _load_session()

func configure(url: String, key: String) -> void:
    project_url = url.strip_edges().trim_suffix("/")
    publishable_key = key.strip_edges()

func is_configured() -> bool:
    return project_url.begins_with("https://") and not publishable_key.is_empty()

func is_signed_in() -> bool:
    return not access_token.is_empty() and not current_user.is_empty()

func sign_up(email: String, password: String, display_name: String) -> void:
    if not _check_config():
        return
    if email.strip_edges().is_empty() or password.length() < 8:
        auth_failed.emit("ایمیل معتبر و گذرواژهٔ حداقل ۸ کاراکتری لازم است.")
        return
    var body := {
        "email": email.strip_edges(),
        "password": password,
        "data": {"display_name": display_name.strip_edges().substr(0, 32)}
    }
    _send("POST", AUTH_BASE + "/signup", body, false, "signup")

func sign_in(email: String, password: String) -> void:
    if not _check_config():
        return
    if email.strip_edges().is_empty() or password.is_empty():
        auth_failed.emit("ایمیل و گذرواژه را وارد کن.")
        return
    _send("POST", AUTH_BASE + "/token?grant_type=password", {
        "email": email.strip_edges(),
        "password": password
    }, false, "signin")

func sign_out() -> void:
    if not access_token.is_empty() and is_configured():
        _send("POST", AUTH_BASE + "/logout", {}, true, "signout")
    access_token = ""
    refresh_token = ""
    current_user = {}
    _save_session()

func load_my_profile() -> void:
    if not is_signed_in():
        request_failed.emit("ابتدا وارد حساب کاربری شو.")
        return
    _send("GET", REST_BASE + "/player_profiles?select=user_id,display_name,created_at,updated_at&limit=1", {}, true, "profile")

func _check_config() -> bool:
    if not is_configured():
        auth_failed.emit("اتصال Supabase تنظیم نشده است. URL و publishable key پروژهٔ اختصاصی چهاربرگ لازم است.")
        return false
    return true

func _send(method: String, path: String, payload: Dictionary, authenticated: bool, tag: String) -> void:
    if _http.get_http_client_status() != HTTPClient.STATUS_DISCONNECTED:
        request_failed.emit("درخواست قبلی هنوز در حال اجراست.")
        return
    var headers := PackedStringArray([
        "Content-Type: application/json",
        "apikey: " + publishable_key
    ])
    if authenticated and not access_token.is_empty():
        headers.append("Authorization: Bearer " + access_token)
    var body := "" if method == "GET" else JSON.stringify(payload)
    var err := _http.request(project_url + path, headers, HTTPClient.METHOD_GET if method == "GET" else _method_from_string(method), body)
    if err != OK:
        if tag == "signin" or tag == "signup":
            auth_failed.emit("ارسال درخواست ناموفق بود: " + str(err))
        else:
            request_failed.emit("ارسال درخواست ناموفق بود: " + str(err))
        return
    _pending_tag = tag

var _pending_tag := ""

func _method_from_string(method: String) -> HTTPClient.Method:
    match method:
        "POST": return HTTPClient.METHOD_POST
        "PATCH": return HTTPClient.METHOD_PATCH
        "PUT": return HTTPClient.METHOD_PUT
        "DELETE": return HTTPClient.METHOD_DELETE
        _: return HTTPClient.METHOD_GET

func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
    var raw := body.get_string_from_utf8()
    var parsed = JSON.parse_string(raw)
    var data: Dictionary = parsed if parsed is Dictionary else {}
    if result != HTTPRequest.RESULT_SUCCESS or response_code < 200 or response_code >= 300:
        var message := str(data.get("msg", data.get("message", data.get("error_description", data.get("error", "خطای ارتباط با سرور")))))
        if _pending_tag == "signin" or _pending_tag == "signup":
            auth_failed.emit(message)
        else:
            request_failed.emit(message)
        _pending_tag = ""
        return
    match _pending_tag:
        "signin":
            _accept_session(data)
        "signup":
            if data.has("access_token"):
                _accept_session(data)
            else:
                auth_failed.emit("حساب ایجاد شد؛ اگر تأیید ایمیل فعال است، ایمیل را تأیید کن و سپس وارد شو.")
        "signout":
            pass
        "profile":
            var rows: Array = parsed if parsed is Array else []
            if not rows.is_empty():
                profile_loaded.emit(rows[0])
            else:
                request_failed.emit("پروفایل پیدا نشد. بررسی کن migration پایگاه داده اجرا شده باشد.")
    _pending_tag = ""

func _accept_session(data: Dictionary) -> void:
    access_token = str(data.get("access_token", ""))
    refresh_token = str(data.get("refresh_token", ""))
    current_user = data.get("user", {}) if data.get("user", {}) is Dictionary else {}
    _save_session()
    auth_succeeded.emit({"user": current_user, "access_token": access_token})

func _save_session() -> void:
    var cfg := ConfigFile.new()
    if not access_token.is_empty():
        cfg.set_value("session", "access_token", access_token)
        cfg.set_value("session", "refresh_token", refresh_token)
        cfg.set_value("session", "user", current_user)
        cfg.save(CONFIG_PATH)
    else:
        DirAccess.remove_absolute(ProjectSettings.globalize_path(CONFIG_PATH))

func _load_session() -> void:
    var cfg := ConfigFile.new()
    if cfg.load(CONFIG_PATH) == OK:
        access_token = str(cfg.get_value("session", "access_token", ""))
        refresh_token = str(cfg.get_value("session", "refresh_token", ""))
        current_user = cfg.get_value("session", "user", {})
