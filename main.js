function Card(suit, rank) {
    this.elem = document.createElement('div');
    this.elem.className = `card card-${suit}-${rank}`;
    this.frontVisible = false;
}

Card.prototype.turnOver = function() {
    this.frontVisible = !this.frontVisible;
    this.elem.classList.add('card-half-rotate');
    return new Promise((resolve, reject) => {
        let onTransitionEnd1, onTransitionEnd2;
        onTransitionEnd1 = e => {
            this.elem.classList.remove('card-half-rotate');
            this.elem.classList.toggle('card-front-visible');
            this.elem.removeEventListener('transitionend', onTransitionEnd1, false);
            this.elem.addEventListener('transitionend', onTransitionEnd2, false);
        };
        this.elem.addEventListener('transitionend', onTransitionEnd1, false);
        onTransitionEnd2 = e => {
            this.elem.removeEventListener('transitionend', onTransitionEnd2, false);
            resolve();
        };

    });
}

// https://stackoverflow.com/a/6274381/5114473
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [],
    deckEl = document.createElement('div');

deckEl.className = 'deck';
document.body.appendChild(deckEl);

for (let suit of suits) {
    for (let rank of ranks) {
        let card = new Card(suit, rank);
        deck.push(card);
    }
}

shuffle(deck);

for (let card of deck) {
    deckEl.appendChild(card.elem);
}

function f(i) {
    let promise = deck[i].turnOver();
    if (i - 1 >= 0) {
        promise.then(_ => {
            setTimeout(_ => {
                deckEl.removeChild(deck[i].elem);
                f(i-1);
            }, 500);
        });
    }
}

setTimeout(f, 0, deck.length-1);
