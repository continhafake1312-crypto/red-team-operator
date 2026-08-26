document.addEventListener("DOMContentLoaded", () => {
  const channelsGrid = document.querySelector(".channels-grid")
  const prevButton = document.querySelector(".nav-prev")
  const nextButton = document.querySelector(".nav-next")

  const menuToggle = document.querySelector(".menu-toggle")
  const mobileMenu = document.getElementById("mobile-menu")
  const mobileMenuClose = document.querySelector(".mobile-menu-close")
  const searchToggle = document.querySelector(".search-toggle")
  const searchForm = document.getElementById("search-form")

  // Handle mobile menu
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      document.body.classList.add("menu-open")
      mobileMenu.dataset.state = "open"
      mobileMenu.style.transform = "translateX(0)"
      menuToggle.setAttribute("aria-expanded", "true")

      // Set focus trap for accessibility
      setTimeout(() => {
        mobileMenu.querySelector("a, button").focus()
      }, 100)
    })
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener("click", () => {
      closeMobileMenu()
    })
  }

  // Close mobile menu function (reusable)
  function closeMobileMenu() {
    document.body.classList.remove("menu-open")
    mobileMenu.dataset.state = "closed"
    mobileMenu.style.transform = "translateX(-100%)"
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false")
  }

  // Close mobile menu with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu && mobileMenu.dataset.state === "open") {
      closeMobileMenu()
    }
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      mobileMenu &&
      mobileMenu.dataset.state === "open" &&
      !mobileMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMobileMenu()
    }
  })

  // Handle search form toggle
  if (searchToggle && searchForm) {
    searchToggle.addEventListener("click", (e) => {
      e.preventDefault()
      searchForm.classList.toggle("active")
      searchForm.setAttribute("aria-hidden", !searchForm.classList.contains("active"))
      searchToggle.setAttribute("aria-expanded", searchForm.classList.contains("active"))

      if (searchForm.classList.contains("active")) {
        setTimeout(() => {
          searchForm.querySelector("input[type=search]").focus()
        }, 100)
      }
    })

    // Close search form when clicking outside
    document.addEventListener("click", (event) => {
      if (
        searchForm.classList.contains("active") &&
        !searchToggle.contains(event.target) &&
        !searchForm.contains(event.target)
      ) {
        searchForm.classList.remove("active")
        searchForm.setAttribute("aria-hidden", "true")
        searchToggle.setAttribute("aria-expanded", "false")
      }
    })

    // Close search form with Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && searchForm.classList.contains("active")) {
        searchForm.classList.remove("active")
        searchForm.setAttribute("aria-hidden", "true")
        searchToggle.setAttribute("aria-expanded", "false")
      }
    })
  }

  // Improved mobile submenu toggles
  const mobileMenuItems = document.querySelectorAll(".mobile-menu-items .menu-item-has-children")

  mobileMenuItems.forEach((item) => {
    const link = item.querySelector("a")
    const submenu = item.querySelector(".sub-menu")

    if (link && submenu) {
      // Create a toggle button
      const toggleBtn = document.createElement("button")
      toggleBtn.className = "submenu-toggle"
      toggleBtn.type = "button"
      toggleBtn.setAttribute("aria-expanded", "false")
      toggleBtn.setAttribute("aria-label", "Toggle submenu")
      toggleBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'

      // Add toggle button after the link
      link.after(toggleBtn)

      // Toggle submenu on click
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true"
        toggleBtn.setAttribute("aria-expanded", !isExpanded)
        item.classList.toggle("active")

        if (item.classList.contains("active")) {
          submenu.style.display = "block"
          submenu.style.height = "auto"
          const height = submenu.offsetHeight
          submenu.style.height = "0"

          // Trigger reflow
          submenu.offsetHeight

          submenu.style.height = `${height}px`
          submenu.style.opacity = "1"
        } else {
          submenu.style.height = "0"
          submenu.style.opacity = "0"

          // Remove display after animation completes
          setTimeout(() => {
            if (!item.classList.contains("active")) {
              submenu.style.display = "none"
            }
          }, 300)
        }
      })

      // Initially hide submenus
      submenu.style.display = "none"
      submenu.style.height = "0"
      submenu.style.opacity = "0"
    }
  })

  // Desktop submenu keyboard accessibility
  const desktopMenuItems = document.querySelectorAll(".nav-menu .menu-item-has-children")

  desktopMenuItems.forEach((item) => {
    const link = item.querySelector("a")
    const submenu = item.querySelector(".sub-menu")

    if (link && submenu) {
      // Add keyboard accessibility
      link.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && window.innerWidth > 768) {
          e.preventDefault()
          item.classList.toggle("hover-active")

          if (item.classList.contains("hover-active")) {
            setTimeout(() => {
              submenu.querySelector("a").focus()
            }, 100)
          }
        }
      })

      // Close submenu when tabbing out
      submenu.querySelectorAll("a").forEach((sublink, index, links) => {
        if (index === links.length - 1) {
          sublink.addEventListener("keydown", (e) => {
            if (e.key === "Tab" && !e.shiftKey) {
              item.classList.remove("hover-active")
            }
          })
        }
      })
    }
  })

  // Channels grid navigation (if applicable)
  if (channelsGrid && prevButton && nextButton) {
    // Calculate scroll amount based on visible columns
    const getScrollAmount = () => {
      const gridComputedStyle = window.getComputedStyle(channelsGrid)
      const columnWidth = channelsGrid.children[0]?.offsetWidth || 0
      const gap = Number.parseInt(gridComputedStyle.gap) || 0
      const visibleWidth = channelsGrid.clientWidth
      const columnsPerScreen = Math.floor(visibleWidth / (columnWidth + gap))
      return (columnWidth + gap) * columnsPerScreen
    }

    // Update arrows visibility
    const updateArrowsVisibility = () => {
      const isAtStart = channelsGrid.scrollLeft <= 0
      const isAtEnd = channelsGrid.scrollLeft >= channelsGrid.scrollWidth - channelsGrid.clientWidth - 1

      prevButton.style.opacity = isAtStart ? "0.5" : "1"
      prevButton.style.pointerEvents = isAtStart ? "none" : "auto"

      nextButton.style.opacity = isAtEnd ? "0.5" : "1"
      nextButton.style.pointerEvents = isAtEnd ? "none" : "auto"
    }

    // Navigation handlers
    prevButton.addEventListener("click", () => {
      channelsGrid.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      })
    })

    nextButton.addEventListener("click", () => {
      channelsGrid.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      })
    })

    // Touch/swipe support
    let touchStartX = 0
    let touchEndX = 0

    channelsGrid.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX
      },
      { passive: true },
    )

    channelsGrid.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX
        handleSwipe()
      },
      { passive: true },
    )

    const handleSwipe = () => {
      const swipeThreshold = 50
      const diff = touchStartX - touchEndX

      if (Math.abs(diff) > swipeThreshold) {
        const scrollAmount = getScrollAmount()
        channelsGrid.scrollBy({
          left: diff > 0 ? scrollAmount : -scrollAmount,
          behavior: "smooth",
        })
      }
    }

    // Update arrows on scroll and resize
    channelsGrid.addEventListener("scroll", updateArrowsVisibility)
    window.addEventListener("resize", () => {
      updateArrowsVisibility()
    })

    // Initial check
    updateArrowsVisibility()
  }

  // Channels carousel initialization
  const channelsCarousel = document.querySelector(".channels-carousel")
  if (channelsCarousel) {
    // We'll handle initChannelsCarousel properly from separate file
    if (typeof window.initChannelsCarousel === "function") {
      window.initChannelsCarousel()
    } else {
      console.log("Channels carousel will be initialized by channels-carousel.js")
    }
  }
})