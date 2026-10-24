extends SceneTree

const Session = preload("res://scripts/game_session.gd")

func _initialize() -> void:
    var game := Session.new()
    game.start_match("♠", 0, 3)
    assert(game.hands.size() == 4, "Match must have four hands.")
    assert(game.hands_per_match == 3, "Three-hand mode must be selected.")
    for hand in game.hands:
        assert(hand.size() == 13, "Every hand starts with 13 cards.")

    var safety := 0
    var human_plays := 0
    while not game.match_over and safety < 40:
        assert(game.current_player == 0, "Control should return to the human after AI turns.")
        var legal := game.human_legal_cards()
        assert(not legal.is_empty(), "Human must have a legal card.")
        assert(game.play_human_card(str(legal[0]["id"])), "A legal card should be accepted.")
        human_plays += 1
        safety += 1

    assert(game.match_over, "Three-hand match must finish.")
    assert(game.hands_completed == 3, "Three complete hands must be played.")
    assert(game.completed_tricks == 13, "Final hand must contain 13 tricks.")
    assert(game.team_hands_won[0] + game.team_hands_won[1] == 3, "Hand wins must total three.")
    assert(human_plays == 39, "Three hands require 39 human card plays.")
    print("PASS: 3-hand match, 39 human plays, AI turns and team hand totals.")
    quit(0)
