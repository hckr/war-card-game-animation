document.addEventListener('click', e => {
    if (e.target.classList.contains('card')) {
        e.target.classList.add('card-half-rotate');
    }
}, false);

document.addEventListener('transitionend', e => {
    if (e.target.classList.contains('card-half-rotate')) {
        e.target.classList.remove('card-half-rotate');
        e.target.classList.toggle('card-visible');
    }
}, false);

function createCard(color, value) {
    let card = document.createElement('div');
    card.className = `card card-${color}-${value}`;
    document.body.appendChild(card);
}

createCard('clubs', 'A');
