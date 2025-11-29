// app.js — THE ONE AND ONLY CART SYSTEM (2025 EDITION)
// Works on: index.html, recommended.html, checkout.html
// No more checkout.js. No more duplicate CSS. No more dead buttons.

let listCart = [];
let products = [];
let isCartOpen = false; // <--- ADD THIS

// =============================================
// 1. PAGE LOAD & INITIALIZATION (FIXED: NO SLIDING BACKGROUND)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const iconCart = document.querySelector('.iconCart');
    const cartDrawer = document.querySelector('.cart');
    const container = document.querySelector('.container');
    const closeBtn = document.querySelector('.cart .close');

    // Centralized Toggle Helper
    const updateCartState = () => {
        if (!cartDrawer) return; // We don't need to check for container anymore

        if (isCartOpen) {
            // OPEN STATE: Just show the cart, don't move the container
            cartDrawer.style.right = '0';
            // REMOVED: container.style.transform = 'translateX(-420px)'; 
        } else {
            // CLOSED STATE
            cartDrawer.style.right = '-100%';
            // REMOVED: container.style.transform = 'translateX(0)';
        }
    };

    // 1. Toggle Button
    if (iconCart) {
        iconCart.addEventListener('click', (e) => {
            e.stopPropagation();
            isCartOpen = !isCartOpen;
            updateCartState();
        });
    }

    // 2. Close Button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            isCartOpen = false;
            updateCartState();
        });
    }

    // 3. Click Outside to Close
    document.addEventListener('click', (e) => {
        if (isCartOpen && cartDrawer) {
            if (!cartDrawer.contains(e.target) && !iconCart.contains(e.target)) {
                isCartOpen = false;
                updateCartState();
            }
        }
    });

    // 4. Prevent clicks inside cart from closing
    if (cartDrawer) {
        cartDrawer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Init Data
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

    // 3. Update quantity badges — FIXED
const totalQtyEls = document.querySelectorAll('.totalQuantity');
const navbarIcon = document.querySelector('.fa-shopping-cart');

totalQtyEls.forEach(el => {
    el.textContent = totalQty > 0 ? totalQty : '0';
});

if (navbarIcon) {
    if (totalQty > 0) {
        navbarIcon.setAttribute('data-count', totalQty);
    } else {
        navbarIcon.removeAttribute('data-count');
    }
}

    // 4. Update ALL total price displays
const totalPriceFormatted = '$' + totalPrice.toFixed(2);

// Checkout page total
const checkoutTotal = document.querySelector('.totalPrice');
if (checkoutTotal) checkoutTotal.textContent = totalPriceFormatted;

// NEW: Navbar total price under cart icon
const navbarTotal = document.querySelector('.cart-total-price');
if (navbarTotal) {
    navbarTotal.textContent = totalPriceFormatted;
    if (totalQty > 0) {
        navbarTotal.classList.add('show');
    } else {
        navbarTotal.classList.remove('show');
    }
}

// --- NEW: UPDATE SLIDING CART TOTAL ---
    const slideInTotal = document.querySelector('.cart .total-bar');
    if (slideInTotal) {
        slideInTotal.innerText = 'Total: ' + totalPriceFormatted;
    }
}