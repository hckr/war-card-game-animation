#!/usr/bin/env python

suits = ['hearts', 'diamonds', 'clubs', 'spades']
ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

for suit in suits:
    for rank in ranks:
        print('.card-front-visible.card-{}-{} {{'.format(suit, rank))
        print("    background-image: url('images/card{}{}.png');".format(suit.capitalize(), rank))
        print('}\n')
