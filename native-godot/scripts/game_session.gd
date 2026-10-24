extends RefCounted
class_name FourBargGameSession

## Local match state for a four-player, trick-taking prototype.
## Player 0 is the human; seats 1-3 are AI. Networked matches must validate
## all submitted moves and scores on a trusted server.

const Rules = preload("res://scripts/game_rules.gd")

signal state_changed
signal trick_completed(winner: int, team_tricks: Array)
signal match_completed(winning_team: int, team_tricks: Array)

var hands: Array = [[], [], [], []]
var current_player := 0
var trump_suit := "♠"
var current_trick: Array[Dictionary] = []
var completed_tricks := 0
var team_tricks: Array[int] = [0, 0]
var match_over := false
var last_trick_winner := -1

func start_match(chosen_trump: String = "♠", first_player: int = 0) -> void:
    hands = Rules.deal_four_players(Rules.shuffled_deck(), first_player)
    current_player = first_player
    trump_suit = chosen_trump if Rules.SUITS.has(chosen_trump) else "♠"
    current_trick.clear()
    completed_tricks = 0
    team_tricks = [0, 0]
    match_over = false
    last_trick_winner = -1
    state_changed.emit()

func human_legal_cards() -> Array:
    if match_over or current_player != 0:
        return []
    return Rules.legal_cards(hands[0], current_trick)

func play_human_card(card_id: String) -> bool:
    if match_over or current_player != 0:
        return false
    var card := _find_card(hands[0], card_id)
    if card.is_empty() or not _is_legal(card, hands[0]):
        return false
    _play_card(0, card)
    _advance_ai_until_human_or_end()
    state_changed.emit()
    return true

func play_ai_turn() -> void:
    if match_over or current_player == 0:
        return
    var card: Dictionary = Rules.choose_ai_card(hands[current_player], current_trick, current_player, trump_suit)
    if not card.is_empty():
        _play_card(current_player, card)
    state_changed.emit()

func _advance_ai_until_human_or_end() -> void:
    var guard := 0
    while not match_over and current_player != 0 and guard < 4:
        play_ai_turn()
        guard += 1

func _play_card(player: int, card: Dictionary) -> void:
    var index := -1
    for i in range(hands[player].size()):
        if hands[player][i].get("id", "") == card.get("id", ""):
            index = i
            break
    if index < 0:
        return
    hands[player].remove_at(index)
    current_trick.append({"player": player, "card": card})
    if current_trick.size() < 4:
        current_player = (player + 1) % 4
        return

    var winner := Rules.trick_winner(current_trick, trump_suit)
    last_trick_winner = winner
    team_tricks[Rules.team_index(winner)] += 1
    completed_tricks += 1
    current_trick.clear()
    current_player = winner
    trick_completed.emit(winner, team_tricks.duplicate())
    if completed_tricks >= 13:
        match_over = true
        var winning_team := 0 if team_tricks[0] > team_tricks[1] else 1
        match_completed.emit(winning_team, team_tricks.duplicate())

func _find_card(hand: Array, card_id: String) -> Dictionary:
    for card in hand:
        if str(card.get("id", "")) == card_id:
            return card
    return {}

func _is_legal(card: Dictionary, hand: Array) -> bool:
    for legal in Rules.legal_cards(hand, current_trick):
        if legal.get("id", "") == card_id_for(card):
            return true
    return false

func card_id_for(card: Dictionary) -> String:
    return str(card.get("id", ""))
