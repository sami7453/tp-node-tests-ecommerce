// tests/testEcommerce.js

const {
    Basket,
    addToBasket,
    removeFromBasket,
    transactionAllowed,
    payBasket,
} = require('../src/app');

function captureConsole(fn) {
    const logs = [];
    const original = console.log;
    try {
        console.log = (...args) => logs.push(args.join(' '));
        const res = fn();
        return { logs: logs, returned: res };
    } finally {
        console.log = original;
    }
}

function testAdd() {
    const basket = new Basket();
    const item = { name: 'Ordinateur portable Dell XPS 13', price: 1249.99 };
    addToBasket(basket, item);

    const ok =
        basket.items.length === 1 &&
        basket.items[0].name === 'Ordinateur portable Dell XPS 13' &&
        basket.totalPrice === 1249.99;
        
    if (!ok) {
        console.error('[testAdd] pb: attendu totalPrice=1249.99 et 1 item; obtenu', basket);
    }
    return ok;
}

function testRemove() {
    const basket = new Basket();
    const item = { name: 'Smartphone Samsung Galaxy S20', price: 899.95 };
    addToBasket(basket, item);
    removeFromBasket(basket, item);

    const ok = basket.items.length === 0 && basket.totalPrice === 0;

    if (!ok) {
        console.error('[testRemove] pb: panier devrait être vide et totalPrice=0, trouvé', basket);
    }
    return ok;
}

function testAddRemove() {
    const basket = new Basket();
    const item = { name: 'Casque Sony WH-1000XM4', price: 349.99 };

    addToBasket(basket, item);
    const afterAddOk =
        basket.items.length === 1 &&
        basket.items[0].name === 'Casque Sony WH-1000XM4' &&
        basket.totalPrice === 349.99;

    removeFromBasket(basket, item);
    const afterRemoveOk = basket.items.length === 0 && basket.totalPrice === 0;

    const ok = afterAddOk && afterRemoveOk;
    if (!ok) {
        console.error('[testAddRemove] souci barbare durant add/remove, panier =', basket);
    }
    return ok;
}

function testTransactionAllowed() {
    const user = { name: 'Jean', balance: 468.75 };

    const allow300 = transactionAllowed(user, 300.45) === true;
    const deny500 = transactionAllowed(user, 500.35) === false;

    const ok = allow300 && deny500;
    if (!ok) {
        console.error('[testTransactionAllowed] pb: attendu true pour 300.45 et false pour 500.35');
    }
    return ok;
}

function testPayBasket() {
    const user = { name: 'Jean', balance: 468.75 };
    const basket = new Basket();
    const item = { name: 'Tablet Samsung Galaxy Tab S7', price: 329.99 };
    addToBasket(basket, item);

    const { logs: logs1, returned: res1 } = captureConsole(() => payBasket(user, basket));

    const cond1 =
        res1 === true &&
        user.balance === 468.75 - 329.99 &&
        logs1.some(l => l.includes('Paiement du panier réussi'));

    const { logs: logs2, returned: res2 } = captureConsole(() => payBasket(user, basket));

    const cond2 =
        res2 === false &&
        user.balance === 468.75 - 329.99 &&
        logs2.some(l => l.includes('Paiement du panier échoué'));

    const ok = cond1 && cond2;
    if (!ok) {
        console.error('[testPayBasket] pb: user=', user, 'logs1=', logs1, 'logs2=', logs2);
    }
    return ok;
}

function testAppEcommerce() {
    let success = testAdd();
    success = success && testRemove();
    success = success && testAddRemove();
    success = success && testTransactionAllowed();
    success = success && testPayBasket();

    if (success) {
        console.log('ok');
    } else {
        console.log('pb');
    }
    return success;
}

if (require.main === module) {
    testAppEcommerce();
}

module.exports = {
    testAdd,
    testRemove,
    testAddRemove,
    testTransactionAllowed,
    testPayBasket,
    testAppEcommerce,
};
