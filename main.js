let card = document.getElementById('card');

document.addEventListener('click', e => {
    if (e.target.classList.contains('card')) {
        card.classList.add('card-half-rotate');
    }
}, false);

document.addEventListener('transitionend', e => {
    if (e.target.classList.contains('card-half-rotate')) {
        card.classList.remove('card-half-rotate');
        card.classList.toggle('card-visible');
    }
}, false);
