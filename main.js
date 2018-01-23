function Card(suit, rank) {
    this.elem = document.createElement('div');
    this.elem.className = `card card-${suit}-${rank}`;
    this.frontVisible = false;
}

Card.prototype.turnOver = function() {
    this.frontVisible = !this.frontVisible;
    this.elem.classList.add('card-half-rotate');
    return new Promise((resolve, reject) => {
        let onTransitionEnd = e => {
            this.elem.classList.remove('card-half-rotate');
            this.elem.classList.toggle('card-front-visible');
            this.elem.removeEventListener('transitionend', onTransitionEnd, false);
            resolve();
        }
        this.elem.addEventListener('transitionend', onTransitionEnd, false);
    });
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let card = new Card('clubs', 'A');
document.body.appendChild(card.elem);
