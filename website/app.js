// app.js — THE ONE AND ONLY CART SYSTEM (2025 EDITION)
// Works on: index.html, recommended.html, checkout.html
// No more checkout.js. No more duplicate CSS. No more dead buttons.

let listCart = [];
let products = [];

// =============================================
// 1. PAGE LOAD & INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cart icon toggle (slide-in cart)
    const iconCart = document.querySelector('.iconCart');
    const cartDrawer = document.querySelector('.cart');
    const container = document.querySelector('.container');
    const closeBtn = document.querySelector('.cart .close');

    if (iconCart && cartDrawer && container) {
        iconCart.addEventListener('click', () => {
            cartDrawer.style.right = cartDrawer.style.right === '0px' ? '-100%' : '0';
            container.style.transform = cartDrawer.style.right === '0px' ? 'translateX(-420px)' : 'translateX(0)';
        });
    }
    if (closeBtn && cartDrawer && container) {
        closeBtn.addEventListener('click', () => {
            cartDrawer.style.right = '-100%';
            container.style.transform = 'translateX(0)';
        });
    }

    loadProducts();
    loadCartFromCookie();
});

// =============================================
// 2. LOAD PRODUCTS + RENDER GRID
// =============================================
function loadProducts() {
    fetch('/website/product.json')
        .then(res => res.json())
        .then(data => {
            products = data;
            renderProductGrid();
        })
        .catch(err => console.error('Products failed to load:', err));
}

function renderProductGrid() {
    const container = document.querySelector('.listProduct');
    if (!container) return;

    container.innerHTML = '';
    products.forEach(p => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h2>${p.name}</h2>
            <div class="price">$${p.price}</div>
            <button onclick="addCart(${p.id})">Add To Cart</button>
        `;
        container.appendChild(item);
    });
}

// =============================================
// 3. CART CORE FUNCTIONS (GLOBAL)
// =============================================
window.addCart = function(id) {
    const prod = products.find(p => p.id == id);
    if (!prod) return;

    const existing = listCart.find(p => p.id == id);
    if (existing) existing.quantity++;
    else listCart.push({ ...prod, quantity: 1 });

    saveCartToCookie();
    renderEverywhere();
};

window.changeQuantity = function(id, action) {
    const item = listCart.find(p => p.id == id);
    if (!item) return;

    if (action === '+') item.quantity++;
    else if (action === '-') {
        item.quantity--;
        if (item.quantity <= 0) listCart = listCart.filter(p => p.id != id);
    }

    saveCartToCookie();
    renderEverywhere();
};

// =============================================
// 4. PERSISTENCE
// =============================================
function saveCartToCookie() {
    document.cookie = `listCart=${JSON.stringify(listCart)}; expires=Thu, 31 Dec 2026 00:00:00 UTC; path=/; SameSite=Lax`;
}

function loadCartFromCookie() {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('listCart='));
    if (cookie) {
        try {
            listCart = JSON.parse(decodeURIComponent(cookie.split('=')[1])) || [];
        } catch (e) {
            listCart = [];
        }
    }
    renderEverywhere();
}

// =============================================
// 5. UNIVERSAL RENDERER — THIS IS THE MAGIC
// =============================================
function renderEverywhere() {
    let totalQty = 0;
    let totalPrice = 0;

    listCart.forEach(p => {
        totalQty += p.quantity;
        totalPrice += p.price * p.quantity;
    });

    // 1. Slide-in cart (.listCart)
    const slideIn = document.querySelector('.listCart');
    if (slideIn) {
        slideIn.innerHTML = listCart.map(p => `
            <div class="item">
                <img src="${p.image}">
                <div class="content">
                    <div class="name">${p.name}</div>
                    <div class="price">$${p.price}</div>
                </div>
                <div class="quantity">
                    <button onclick="changeQuantity(${p.id},'-')">-</button>
                    <span>${p.quantity}</span>
                    <button onclick="changeQuantity(${p.id},'+')">+</button>
                </div>
            </div>
        `).join('');
    }

    // 2. Checkout page (.returnCart .list)
    const checkoutList = document.querySelector('.returnCart .list');
    if (checkoutList) {
        checkoutList.innerHTML = listCart.length === 0
            ? '<div class="emptyCart">Your cart is empty</div>'
            : listCart.map(p => `
                <div class="item">
                    <img src="${p.image}">
                    <div class="info">
                        <div class="name">${p.name}</div>
                        <div class="price">$${p.price}/ea</div>
                    </div>
                    <div class="quantity">
                        <button onclick="changeQuantity(${p.id},'-')">-</button>
                        <span>${p.quantity}</span>
                        <button onclick="changeQuantity(${p.id},'+')">+</button>
                    </div>
                    <div class="returnPrice">$${(p.price * p.quantity).toFixed(2)}</div>
                </div>
            `).join('');
    }

    // 3. Update all quantity badges
    document.querySelectorAll('.totalQuantity, .fa-shopping-cart').forEach(el => {
        if (totalQty > 0) {
            el.textContent = totalQty;
            if (el.hasAttribute('data-count')) el.setAttribute('data-count', totalQty);
        } else {
            el.textContent = '0';
            if (el.hasAttribute('data-count')) el.removeAttribute('data-count');
        }
    });

    // 4. Update checkout total price
    const totalPriceEl = document.querySelector('.totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = '$' + totalPrice.toFixed(2);
}