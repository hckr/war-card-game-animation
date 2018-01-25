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

function rectToAbsPercentPos(rect) {
    let top = rect.y / window.innerHeight * 100,
        left = rect.x  / window.innerWidth * 100;
    return [top, left];
}

function dealCard(deck, hands, handEls, playerInd) {
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

function dealCards(deck, hands, handEls) {
    return new Promise((resolve, reject) => {
        (function f(deck, hands, handEls, player) {
            if (deck.length == 0) {
                resolve();
                return;
            }
            dealCard(deck, hands, handEls, player).then(
                _ => f(deck, hands, handEls, (player + 1) % 2));
        })(deck, hands, handEls, 0);
    });
}

function playCard(hands, handEls, tables, tableEls, playerInd) {
    let card = hands[playerInd].pop();
    tables[playerInd].push(card);
    let rect = card.elem.getBoundingClientRect();
    document.body.appendChild(card.elem);
    let [currTop, currLeft] = rectToAbsPercentPos(rect);
    card.elem.style.top = currTop + '%';
    card.elem.style.left = currLeft + '%';
    card.elem.classList.add('card-detached');
    return new Promise((resolve, reject) => {
        let rect = tableEls[playerInd].getBoundingClientRect();
        let [newTop, newLeft] = rectToAbsPercentPos(rect);
        function onTransitionEnd() {
            tableEls[playerInd].appendChild(card.elem);
            card.elem.removeEventListener('transitionend', onTransitionEnd, false);
            card.elem.classList.remove('card-detached');
            card.elem.style.top = null;
            card.elem.style.left = null;
            card.elem.style.transform = null;
            resolve(card);
        }
        card.elem.addEventListener('transitionend', onTransitionEnd, false);
        card.elem.style.top = newTop + '%';
        card.elem.style.left = newLeft + '%';
        card.elem.style.transform = 'rotate(0)';
    });
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function gameAnimation(parent) {
    let animRootEl = document.createElement('div'),
        leftHandWrapperEl = document.createElement('div'),
        tableWrapperEl = document.createElement('div'),
        leftTableWrapperEl = document.createElement('div'),
        rightTableWrapperEl = document.createElement('div'),
        rightHandWrapperEl = document.createElement('div');

    animRootEl.className = 'card-anim-root';
    leftHandWrapperEl.className = 'hand-wrapper';
    tableWrapperEl.className = 'table-wrapper';
    leftTableWrapperEl.className = 'player-table-wrapper';
    rightTableWrapperEl.className = 'player-table-wrapper';
    rightHandWrapperEl.className = 'hand-wrapper';

    animRootEl.appendChild(leftHandWrapperEl);
    animRootEl.appendChild(tableWrapperEl);
    animRootEl.appendChild(rightHandWrapperEl);
    parent.appendChild(animRootEl);

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
        handEls = [],
        tables = [[], []],
        tableEls = [];

    for (let i = 0; i < numPlayers; ++i) {
        let handEl = document.createElement('div');
        handEl.className = 'hand';
        handEls.push(handEl);

        let tableEl = document.createElement('div');
        tableEl.className = 'player-table';
        tableEls.push(tableEl);
    }

    leftHandWrapperEl.appendChild(handEls[0]);
    tableWrapperEl.appendChild(deckEl);
    leftTableWrapperEl.appendChild(tableEls[0]);
    rightTableWrapperEl.appendChild(tableEls[1]);
    rightHandWrapperEl.appendChild(handEls[1]);

    dealCards(deck, hands, handEls).then(
        _ => {
            tableWrapperEl.innerHTML = '';
            tableWrapperEl.appendChild(leftTableWrapperEl);
            tableWrapperEl.appendChild(rightTableWrapperEl);

            setTimeout(_ => {
                playCard(hands, handEls, tables, tableEls, 0).then(
                    card => card.turnOver());
                playCard(hands, handEls, tables, tableEls, 1).then(
                    card => card.turnOver());
            }, 500);
        });
}
