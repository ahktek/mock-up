/**
 * ELVYN – LUXURY FRAGRANCE SITE 2025
 * Fully working • No context loss • Hover + Click + Animated Dropdowns
 */

class SiteNavigation {
  constructor() {
    this.boundCloseAll = this.closeAllDropdowns.bind(this);
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSearchOverlay();
    this.setupDropdownMenus();
    this.setupGlobalClickAndEscapeHandlers();
  }

  /// LUXURY MOBILE DRAWER MENU – 2025
setupMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!menuToggle || !mobileDrawer) return;

  const openMenu = () => {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', openMenu);
  drawerClose?.addEventListener('click', closeMenu);
  drawerOverlay?.addEventListener('click', closeMenu);
  // Close drawer when clicking normal links — BUT NOT when clicking the category dropdown toggle
drawerLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // If the clicked link (or its parent) is the dropdown toggle → DO NOT close drawer
    if (link.classList.contains('dropdown-toggle-mobile') || 
        link.closest('.dropdown-toggle-mobile')) {
      return; // ← do nothing → keeps drawer open
    }
    closeMenu();
  });
});

  // MOBILE DRAWER: Shop Categories Dropdown – FINAL FIXED VERSION
  document.querySelectorAll('.dropdown-toggle-mobile').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      const submenu = this.nextElementSibling;
      
      // Toggle active class on both submenu and the toggle button
      submenu.classList.toggle('active');
      this.classList.toggle('active');  // ← this triggers CSS rotation (no conflict!)
    });
  });
}

  // ==================== SEARCH OVERLAY ====================
  setupSearchOverlay() {
    const searchIcon = document.getElementById("search-icon");
    const searchForm = document.getElementById("search-form");
    const closeBtn = document.getElementById("4");

    if (!searchIcon || !searchForm) return;

    const openSearch = e => {
      e?.preventDefault();
      searchForm.classList.add("active");
      setTimeout(() => searchForm.querySelector("input")?.focus(), 300);
    };

    const closeSearch = () => searchForm.classList.remove("active");

    searchIcon.addEventListener("click", openSearch);
    closeBtn?.addEventListener("click", closeSearch);

    document.addEventListener("click", e => {
      if (searchForm.classList.contains("active") &&
          !searchForm.contains(e.target) &&
          !searchIcon.contains(e.target)) {
        closeSearch();
      }
    });
  }


// ==================== LUXURY DROPDOWN MENUS (HOVER + CLICK + ANIMATED) ====================
  setupDropdownMenus() {
    document.querySelectorAll(".mega-dropdown").forEach(dropdown => {        // ← CHANGED
    const toggle = dropdown.querySelector(".mega-toggle");                 // ← CHANGED
    const menu   = dropdown.querySelector(".mega-panel");
      if (!toggle || !menu) return;

      // 1. Timer Variable
      let hideTimeout = null;

      // ARIA Setup
      toggle.setAttribute("role", "button");
      toggle.setAttribute("aria-haspopup", "true");
      toggle.setAttribute("aria-expanded", "false");

      // --- ACTION: OPEN (Cancels any closing) ---
      const openMenu = () => {
        if (hideTimeout) clearTimeout(hideTimeout); // Stop the close timer!

        // Close all other menus first
        document.querySelectorAll(".mega-panel").forEach(m => {
          if (m !== menu) m.classList.remove("show");
        });
        document.querySelectorAll(".mega-toggle").forEach(t => {
          if (t !== toggle) t.setAttribute("aria-expanded", "false");
        });

        // Open this one
        menu.classList.add("show");
        toggle.setAttribute("aria-expanded", "true"); // THIS ROTATES THE ARROW DOWN
      };

      // --- ACTION: CLOSE IMMEDIATE (For Clicks) ---
      const closeMenuImmediate = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false"); // THIS ROTATES THE ARROW UP
      };

      // --- ACTION: CLOSE DELAYED (For Hover) ---
      const closeMenuDelayed = () => {
        hideTimeout = setTimeout(() => {
          closeMenuImmediate();
        }, 300); // <--- 300ms "Grace Period"
      };

      // --- EVENT LISTENERS ---

      // 1. CLICK: Always Instant (No lag)
      toggle.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        // If open, close instantly. If closed, open instantly.
        menu.classList.contains("show") ? closeMenuImmediate() : openMenu();
      });

      // 2. HOVER: Use the Delay
      dropdown.addEventListener("mouseenter", openMenu);
      dropdown.addEventListener("mouseleave", closeMenuDelayed); // Wait before closing

      // 3. MENU HOVER: Keep it open if mouse is inside the menu
      menu.addEventListener("mouseenter", () => {
         if (hideTimeout) clearTimeout(hideTimeout);
      });

      // 4. KEYBOARD
      toggle.addEventListener("keydown", e => {
        if (["Enter", " ", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          if (e.key === "ArrowDown") openMenu();
          else toggle.click(); // Triggers the click listener above
        }
      });
    });
  }

  // Close all dropdowns – bound to correct `this`
  closeAllDropdowns() {
  document.querySelectorAll(".dropdown-menu").forEach(menu => menu.classList.remove("show"));
  document.querySelectorAll(".dropdown-toggle").forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
}

  // Global handlers – now using bound method
  setupGlobalClickAndEscapeHandlers() {
    document.addEventListener("click", this.boundCloseAll);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        this.boundCloseAll();
        document.getElementById("search-form")?.classList.remove("active");
      }
    });
  }
}

// ===================== HERO SLIDER (PARALLAX ENABLED) =====================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Safety Check: Ensure Swiper library is loaded
    if (typeof Swiper !== 'undefined' && document.querySelector('.home-slider')) {
        
        const heroSlider = new Swiper(".home-slider", {
            // ESSENTIAL SETTINGS
            loop: true,
            speed: 1500,        // Slow transition = Luxury feel
            parallax: true,     // <--- The Magic Key. Enables the 3D effect.
            
            // AUTOPLAY
            autoplay: {
                delay: 6000,    // 6 seconds per slide
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },

            // NAVIGATION ARROWS
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            
            // DOTS PAGINATION
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                dynamicBullets: true // Makes dots change size (nice touch)
            },

            // KEYBOARD CONTROL
            keyboard: {
                enabled: true,
            }
        });
    } else {
        console.warn("Swiper JS not found or .home-slider missing");
    }
});

