// app.js — FINAL ROBUST VERSION

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTORS
    let iconCart = document.querySelector('.iconCart');
    let cart = document.querySelector('.cart');
    let container = document.querySelector('.container');
    let close = document.querySelector('.close');

    // 2. TOGGLE EVENTS (Only if elements exist)
    if (iconCart && cart && container) {
        iconCart.addEventListener('click', function(){
            if(cart.style.right == '-100%'){
                cart.style.right = '0';
                container.style.transform = 'translateX(-400px)';
            }else{
                cart.style.right = '-100%';
                container.style.transform = 'translateX(0)';
            }
        });
    }
    if (close && cart && container) {
        close.addEventListener('click', function (){
            cart.style.right = '-100%';
            container.style.transform = 'translateX(0)';
        });
    }

    // 3. INITIALIZE
    loadProducts();
    checkCart(); // This triggers the badge update
});

// GLOBAL VARIABLES
let listCart = [];
let products = [];

function loadProducts() {
    fetch('product.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();
        })
        .catch(e => console.error("Product load error:", e));
}

function addDataToHTML(){
    let listProductHTML = document.querySelector('.listProduct');
    if (!listProductHTML) return;

    listProductHTML.innerHTML = '';
    if(products != null){
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('item');
            newProduct.innerHTML = 
            `<img src="${product.image}" alt="">
            <h2>${product.name}</h2>
            <div class="price">$${product.price}</div>
            <button onclick="addCart(${product.id})">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
}

// --- CRITICAL FIX: SAFE COOKIE PARSING ---
function checkCart() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('listCart='));
    
    if (cookieValue) {
        try {
            // 1. Get the string value
            let jsonString = cookieValue.split('=')[1];
            
            // 2. Handle encoding differences (Safe Decode)
            try {
                jsonString = decodeURIComponent(jsonString);
            } catch(e) {
                // If decoding fails, use raw string
            }

            // 3. Parse JSON
            let rawData = JSON.parse(jsonString);

            // 4. CLEAN THE DATA (Remove nulls from index 0)
            listCart = rawData.filter(item => item !== null && item !== undefined);
            
        } catch (e) {
            console.error("Cart Reset: Data corrupted", e);
            listCart = [];
        }
    }
    // Update Badge Immediately
    updateHeaderBadge();
}

function updateHeaderBadge() {
    // 1. Calculate Total safely
    let total = 0;
    if (listCart && Array.isArray(listCart)) {
        listCart.forEach(product => {
            // Only add if product exists and has quantity
            if (product && typeof product.quantity === 'number') {
                total += product.quantity;
            }
        });
    }

    // 2. Update the Navbar Icon (Index.html)
    const headerIcon = document.querySelector('.fa-shopping-cart');
    if (headerIcon) {
        if (total > 0) {
            headerIcon.setAttribute('data-count', total);
        } else {
            // Remove attribute so the red circle disappears
            headerIcon.removeAttribute('data-count');
        }
    }

    // 3. Update Text Badges (Recommended.html)
    const textBadges = document.querySelectorAll('.totalQuantity');
    textBadges.forEach(badge => {
        badge.innerText = total;
    });
}

// --- CART ACTIONS ---

// Make accessible globally for HTML onclick
window.addCart = function($idProduct){
    let productsCopy = JSON.parse(JSON.stringify(products));
    
    // Fix: Use .find instead of index access to prevent [null] holes
    let existingProduct = listCart.find(p => p && p.id == $idProduct);

    if(!existingProduct) {
        let productToAdd = productsCopy.find(product => product.id == $idProduct);
        if(productToAdd){
            productToAdd.quantity = 1;
            listCart.push(productToAdd);
        }
    } else {
        existingProduct.quantity++;
    }

    saveCart();
    addCartToHTML();
    updateHeaderBadge(); 
}

window.changeQuantity = function($idProduct, $type){
    let index = listCart.findIndex(p => p.id == $idProduct);
    if(index !== -1){
        if ($type === '+') {
            listCart[index].quantity++;
        } else if ($type === '-') {
            listCart[index].quantity--;
            if (listCart[index].quantity <= 0) {
                listCart.splice(index, 1);
            }
        }
    }

    saveCart();
    addCartToHTML();
    updateHeaderBadge();
}

function saveCart() {
    let timeSave = "expires=Thu, 31 Dec 2025 23:59:59 UTC";
    // This saves the CLEAN array, effectively fixing your cookie permanently
    document.cookie = "listCart=" + JSON.stringify(listCart) + "; " + timeSave + "; path=/;";
}

function addCartToHTML(){
    let listCartHTML = document.querySelector('.listCart');
    let totalHTML = document.querySelector('.totalQuantity');

    if (!listCartHTML) {
        updateHeaderBadge(); // Still update badge even if sidebar is missing
        return;
    }

    listCartHTML.innerHTML = '';
    let totalQuantity = 0;

    listCart.forEach(product => {
        if(product){
            let newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.innerHTML = 
                `<img src="${product.image}">
                <div class="content">
                    <div class="name">${product.name}</div>
                    <div class="price">$${product.price}</div>
                </div>
                <div class="quantity">
                    <button onclick="changeQuantity(${product.id}, '-')">-</button>
                    <span class="value">${product.quantity}</span>
                    <button onclick="changeQuantity(${product.id}, '+')">+</button>
                </div>`;
            listCartHTML.appendChild(newCart);
            totalQuantity += product.quantity;
        }
    });

    if (totalHTML) totalHTML.innerText = totalQuantity;
    updateHeaderBadge();
}