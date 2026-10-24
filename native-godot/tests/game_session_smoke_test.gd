extends SceneTree

const Session = preload("res://scripts/game_session.gd")

func _initialize() -> void:
    var game := Session.new()
    game.start_match("♠", 0)
    assert(game.hands.size() == 4, "Match must have four hands.")
    for hand in game.hands:
        assert(hand.size() == 13, "Every hand starts with 13 cards.")

    var safety := 0
    while not game.match_over and safety < 13:
        assert(game.current_player == 0, "Control should return to the human after AI turns.")
        var legal := game.human_legal_cards()
        assert(not legal.is_empty(), "Human must have a legal card.")
        assert(game.play_human_card(str(legal[0]["id"])), "A legal card should be accepted.")
        safety += 1

    assert(game.match_over, "A full match should end after 13 tricks.")
    assert(game.completed_tricks == 13, "A full match has 13 completed tricks.")
    assert(game.team_tricks[0] + game.team_tricks[1] == 13, "Team trick totals must add to 13.")
    for hand in game.hands:
        assert(hand.is_empty(), "All cards should be played by match end.")
    print("PASS: full 13-trick match, legal human plays, AI turns, team totals.")
    quit(0)
