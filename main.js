function Card(suit, rank) {
    this.elem = document.createElement('div');
    this.elem.className = `card card-${suit}-${rank}`;
    this.elem.style.transform = `rotate(${Math.random() * 8 - 4}deg)`;
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

let numPlayers = 2,
    hands = [[], []],
    handEls = [];

for (let i = 0; i < numPlayers; ++i) {
    let el = document.createElement('div');
    el.className = 'hand';
    handEls.push(el);
}

document.body.appendChild(handEls[0]);
document.body.appendChild(deckEl);
document.body.appendChild(handEls[1]);

function rectToAbsPercentPos(rect) {
    let top = (rect.top + rect.height / 2) / window.innerHeight * 100,
        left = (rect.left + rect.width / 2) / window.innerWidth * 100;
    return [top, left];
}

function dealCard(playerInd) {
    let card = deck.pop();
    hands[playerInd].push(card);
    let rect = card.elem.getBoundingClientRect();
    document.body.appendChild(card.elem);
    let [currTop, currLeft] = rectToAbsPercentPos(rect);
    card.elem.style.top = currTop + '%';
    card.elem.style.left = currLeft + '%';
    card.elem.classList.add('card-detached');
    return new Promise((resolve, reject) => {
        let rect = handEls[playerInd].getBoundingClientRect();
        let [newTop, newLeft] = rectToAbsPercentPos(rect);
        function onTransitionEnd() {
            handEls[playerInd].appendChild(card.elem);
            card.elem.removeEventListener('transitionend', onTransitionEnd, false);
            card.elem.classList.remove('card-detached');
            card.elem.style.top = null;
            card.elem.style.left = null;
            resolve();
        }
        card.elem.addEventListener('transitionend', onTransitionEnd, false);
        card.elem.style.top = newTop + '%';
        card.elem.style.left = newLeft + '%';
    });
}

function f(player) {
    if (deck.length == 0) {
        return;
    }
    dealCard(player).then(_ => f((player + 1) % 2));
}

setTimeout(f, 0, 0);
