function Card(suit, rank) {
    this.elem = document.createElement('div');
    this.elem.className = `card card-${suit}-${rank}`;
    this.elem.style.transform = `rotate(${Math.random() * 8 - 4}deg)`;
    this.frontVisible = false;
    this.rank = rank;
}

Card.prototype.turnOver = function() {
    this.frontVisible = !this.frontVisible;
    return new Promise((resolve, reject) => {
        let onTransitionEnd1, onTransitionEnd2;
        onTransitionEnd1 = e => {
            this.elem.removeEventListener('transitionend', onTransitionEnd1, false);
            this.elem.addEventListener('transitionend', onTransitionEnd2, false);
            this.elem.classList.toggle('card-front-visible');
            this.elem.classList.remove('card-half-rotate');
        };
        this.elem.addEventListener('transitionend', onTransitionEnd1, false);
        onTransitionEnd2 = e => {
            this.elem.removeEventListener('transitionend', onTransitionEnd2, false);
            resolve();
        };
        setTimeout(_ => this.elem.classList.add('card-half-rotate'));
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
            card.elem.removeEventListener('transitionend', onTransitionEnd, false);
            handEls[playerInd].appendChild(card.elem);
            card.elem.classList.remove('card-detached');
            card.elem.style.top = null;
            card.elem.style.left = null;
            setTimeout(resolve, 50);
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

// extract code shared with dealCard?
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
            card.elem.removeEventListener('transitionend', onTransitionEnd, false);
            tableEls[playerInd].appendChild(card.elem);
            card.elem.classList.remove('card-detached');
            card.elem.style.top = null;
            card.elem.style.left = null;
            card.elem.style.transform = null;
            setTimeout(_ => resolve(card), 50);
        }
        card.elem.addEventListener('transitionend', onTransitionEnd, false);
        card.elem.style.top = newTop + '%';
        card.elem.style.left = newLeft + '%';
        card.oldTransform = card.elem.style.transform;
        card.elem.style.transform = 'rotate(0)';
    });
}

function awardCardsFromTables(hands, handEls, tables, tableEls, playerInd) {
    let handRect = handEls[playerInd].getBoundingClientRect();
    let [newTop, newLeft] = rectToAbsPercentPos(handRect);

    let promises = [];
    for (let table of tables) {
        while (table.length > 0) {
            let card = table.pop();
            hands[playerInd].unshift(card);

            let rect = card.elem.getBoundingClientRect();
            document.body.appendChild(card.elem);
            let [currTop, currLeft] = rectToAbsPercentPos(rect);
            card.elem.style.top = currTop + '%';
            card.elem.style.left = currLeft + '%';
            card.elem.style.transform = 'rotate(0)';
            card.elem.classList.add('card-detached');

            promises.push(new Promise((resolve, reject) => {
                function onTransitionEnd(e) {
                    card.elem.removeEventListener('transitionend', onTransitionEnd, false);
                    handEls[playerInd].insertBefore(card.elem, handEls[playerInd].firstChild);
                    card.elem.classList.remove('card-detached');
                    card.elem.style.top = null;
                    card.elem.style.left = null;
                    setTimeout(resolve, 50);
                }
                card.elem.addEventListener('transitionend', onTransitionEnd, false);
                setTimeout(_ => {
                    card.elem.style.top = newTop + '%';
                    card.elem.style.left = newLeft + '%';
                    card.elem.style.transform = card.oldTransform;
                }, 20);
            }));
        }
    }
    return Promise.all(promises);
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4'];//, '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function gameLoop(hands, handEls, tables, tableEls) {
    (function f() {
        setTimeout(_ => {
            let p1 = playCard(hands, handEls, tables, tableEls, 0),
                p2 = playCard(hands, handEls, tables, tableEls, 1);
            Promise.all([p1, p2]).then(cards => {
                let ps = cards.map(c => c.turnOver());
                Promise.all(ps).then(_ => {
                    setTimeout(_ => {
                        let ps = cards.map(c => c.turnOver());
                        Promise.all(ps).then(_ => {
                            let [c1, c2] = cards;
                            if (c1.rank == c2.rank) {
                                console.error('War – not yet implemented.');
                                return;
                            } else if (c1.rank < c2.rank) {
                                awardCardsFromTables(hands, handEls, tables, tableEls, 1).then(f);
                            } else {
                                awardCardsFromTables(hands, handEls, tables, tableEls, 0).then(f);
                            }
                        });
                    }, 500);
                });
            });
        }, 500);
    })();
}

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

            gameLoop(hands, handEls, tables, tableEls);
        });
}
