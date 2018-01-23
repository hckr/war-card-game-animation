function Card(color, value) {
    this.elem = document.createElement('div');
    this.elem.className = `card card-${color}-${value}`;
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

let card = new Card('clubs', 'A');
document.body.appendChild(card.elem);
