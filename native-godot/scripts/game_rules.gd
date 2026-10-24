extends RefCounted
class_name FourBargRules

const SUITS: Array[String] = ["♠", "♥", "♦", "♣"]
const RANKS: Array[String] = ["۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "سرباز", "بی‌بی", "شاه", "آس"]
const VALUES: Array[int] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

static func create_deck() -> Array[Dictionary]:
    var deck: Array[Dictionary] = []
    for suit in SUITS:
        for i in range(RANKS.size()):
            deck.append({
                "id": "%s-%s" % [suit, RANKS[i]],
                "suit": suit,
                "rank": RANKS[i],
                "value": VALUES[i],
                "color": "red" if suit == "♥" or suit == "♦" else "black"
            })
    return deck

static func shuffled_deck() -> Array[Dictionary]:
    var deck := create_deck()
    deck.shuffle()
    return deck

static func deal_four_players(deck: Array[Dictionary], first_player: int = 0) -> Array:
    var hands: Array = [[], [], [], []]
    for i in range(deck.size()):
        hands[(first_player + i) % 4].append(deck[i])
    return hands

static func legal_cards(hand: Array, trick: Array) -> Array:
    if trick.is_empty():
        return hand.duplicate()
    var led_suit: String = trick[0]["card"]["suit"]
    var matching: Array = hand.filter(func(card): return card["suit"] == led_suit)
    return matching if not matching.is_empty() else hand.duplicate()

static func card_strength(card: Dictionary, led_suit: String, trump_suit: String) -> int:
    if card["suit"] == trump_suit:
        return 100 + int(card["value"])
    if card["suit"] == led_suit:
        return int(card["value"])
    return 0

static func trick_winner(trick: Array, trump_suit: String) -> int:
    if trick.size() != 4:
        return -1
    var led_suit: String = trick[0]["card"]["suit"]
    var best_index := 0
    var best_strength := -1
    for i in range(trick.size()):
        var item: Dictionary = trick[i]
        var strength := card_strength(item["card"], led_suit, trump_suit)
        if strength > best_strength:
            best_strength = strength
            best_index = i
    return int(trick[best_index]["player"])

static func team_index(player: int) -> int:
    return player % 2

static func choose_ai_card(hand: Array, trick: Array, player: int, trump_suit: String) -> Dictionary:
    var legal := legal_cards(hand, trick)
    if legal.is_empty():
        return {}
    if trick.is_empty():
        # Lead the longest suit; break ties toward the suit with the strongest top card.
        var best_suit := str(legal[0]["suit"])
        var best_count := -1
        var best_high := -1
        for suit in SUITS:
            var same: Array = legal.filter(func(card): return card["suit"] == suit)
            var high := 0
            for card in same:
                high = maxi(high, int(card["value"]))
            if same.size() > best_count or (same.size() == best_count and high > best_high):
                best_suit = suit
                best_count = same.size()
                best_high = high
        var leads: Array = legal.filter(func(card): return card["suit"] == best_suit)
        leads.sort_custom(func(a, b): return int(a["value"]) > int(b["value"]))
        for card in leads:
            if int(card["value"]) >= 13:
                return card
        return leads[leads.size() - 1] if not leads.is_empty() else legal[0]

    var current_winner := trick_winner_partial(trick, trump_suit)
    var partner_is_winning := current_winner >= 0 and team_index(current_winner) == team_index(player)
    var non_trumps: Array = legal.filter(func(card): return card["suit"] != trump_suit)
    if partner_is_winning:
        return lowest_card(non_trumps if not non_trumps.is_empty() else legal)

    var winning: Array = []
    for card in legal:
        var candidate := trick.duplicate()
        candidate.append({"card": card, "player": player})
        if trick_winner_partial(candidate, trump_suit) == player:
            winning.append(card)
    if not winning.is_empty():
        winning.sort_custom(func(a, b):
            var at := 1 if a["suit"] == trump_suit else 0
            var bt := 1 if b["suit"] == trump_suit else 0
            return at < bt if at != bt else int(a["value"]) < int(b["value"])
        )
        return winning[0]
    return lowest_card(non_trumps if not non_trumps.is_empty() else legal)

static func lowest_card(cards: Array) -> Dictionary:
    var result: Dictionary = cards[0]
    for card in cards:
        if int(card["value"]) < int(result["value"]):
            result = card
    return result

static func trick_winner_partial(trick: Array, trump_suit: String) -> int:
    if trick.is_empty():
        return -1
    var led_suit: String = trick[0]["card"]["suit"]
    var best: Dictionary = trick[0]
    var best_strength := card_strength(best["card"], led_suit, trump_suit)
    for item in trick:
        var strength := card_strength(item["card"], led_suit, trump_suit)
        if strength > best_strength:
            best = item
            best_strength = strength
    return int(best["player"])
