extends SceneTree

const Rules = preload("res://scripts/game_rules.gd")

func _initialize() -> void:
    var deck := Rules.create_deck()
    assert(deck.size() == 52, "A standard deck must contain 52 cards.")
    var ids := {}
    for card in deck:
        assert(not ids.has(card["id"]), "Card IDs must be unique.")
        ids[card["id"]] = true
    assert(ids.size() == 52, "All 52 cards must be unique.")

    var dealt: Array = Rules.deal_four_players(deck)
    assert(dealt.size() == 4, "There must be four players.")
    for hand in dealt:
        assert(hand.size() == 13, "Each player must receive 13 cards.")

    var hand: Array = [
        {"id":"♠-۲", "suit":"♠", "rank":"۲", "value":2},
        {"id":"♥-آس", "suit":"♥", "rank":"آس", "value":14}
    ]
    var trick: Array = [{"card":{"id":"♠-شاه", "suit":"♠", "value":13}, "player":0}]
    var legal := Rules.legal_cards(hand, trick)
    assert(legal.size() == 1 and legal[0]["suit"] == "♠", "Must follow suit when possible.")

    var completed: Array = [
        {"card":{"suit":"♠", "value":13}, "player":0},
        {"card":{"suit":"♠", "value":14}, "player":1},
        {"card":{"suit":"♥", "value":14}, "player":2},
        {"card":{"suit":"♠", "value":10}, "player":3}
    ]
    assert(Rules.trick_winner(completed, "♥") == 2, "Trump must beat the led suit.")
    print("PASS: deck, unique IDs, 4x13 deal, follow-suit and trump winner.")
    quit(0)
