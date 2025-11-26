// Always use an object (keyed by productId)
let listCart = {};

// 1. Load cart from cookie
function checkCart() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('listCart='));

    if (cookieValue) {
        try {
            const encoded = cookieValue.split('=')[1];
            const jsonStr = decodeURIComponent(encoded);
            const parsed = JSON.parse(jsonStr);
            // Ensure it's an object
            if (parsed && typeof parsed === 'object') {
                listCart = parsed;
            } else {
                listCart = {};
            }
        } catch (e) {
            console.error('Error parsing cart cookie', e);
            listCart = {};
        }
    } else {
        listCart = {};
    }
}
checkCart();

// 2. Save cart to cookie
function saveCartToCookie() {
    const value = encodeURIComponent(JSON.stringify(listCart));
    // Added 'SameSite=Lax' for modern browser security warnings
    document.cookie = "listCart=" + value + "; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/; SameSite=Lax";
}

// 3. Change quantity (+ or -)
function changeQuantity(productId, action) {
    // productId may be passed as number; keys in object are strings
    const key = String(productId);
    if (!listCart[key]) return;

    if (action === '+') {
        listCart[key].quantity++;
    } else if (action === '-') {
        listCart[key].quantity--;
        if (listCart[key].quantity <= 0) {
            delete listCart[key];  // Auto-remove when 0
        }
    }

    saveCartToCookie();
    addCartToHTML();
}

// 4. Render cart
function addCartToHTML() {
    const listCartHTML = document.querySelector('.returnCart .list');
    const totalQuantityHTML = document.querySelector('.totalQuantity');
    const totalPriceHTML = document.querySelector('.totalPrice');

    if (!listCartHTML || !totalQuantityHTML || !totalPriceHTML) return;

    listCartHTML.innerHTML = '';

    let totalQuantity = 0;
    let totalPrice = 0;

    const keys = Object.keys(listCart);
    if (keys.length > 0) {
        keys.forEach(key => {
            const product = listCart[key];
            if (!product) return;

            const newItem = document.createElement('div');
            newItem.classList.add('item');
            
            // SECURITY NOTE: Ensure product.name and image are sanitized before using innerHTML
            newItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="info">
                    <div class="name">${product.name}</div>
                    <div class="price">$${product.price}/unit</div>
                </div>

                <div class="quantity-controls">
                    <button onclick="changeQuantity('${product.id}', '-')" class="qty-btn">-</button>
                    <span class="quantity">${product.quantity}</span>
                    <button onclick="changeQuantity('${product.id}', '+')" class="qty-btn">+</button>
                </div>

                <div class="returnPrice">$${(product.price * product.quantity).toFixed(2)}</div>
            `;
            listCartHTML.appendChild(newItem);

            totalQuantity += product.quantity;
            totalPrice += product.price * product.quantity;
        });
    } else {
        listCartHTML.innerHTML = '<div class="emptyCart">Your cart is empty</div>';
    }

    totalQuantityHTML.innerText = totalQuantity;
    totalPriceHTML.innerText = '$' + totalPrice.toFixed(2);
}

// 5. Clear entire cart
function clearCart() {
    if (confirm("Remove all items from cart?")) {
        listCart = {};
        saveCartToCookie();
        addCartToHTML();
    }
}

// Run on load
addCartToHTML();