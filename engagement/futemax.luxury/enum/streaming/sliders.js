document.addEventListener("DOMContentLoaded", () => {
  function initSlider(sliderClass) {
    const slider = document.querySelector(sliderClass)
    if (!slider) return

    const prevButton = slider.parentElement.querySelector(".slider-prev")
    const nextButton = slider.parentElement.querySelector(".slider-next")
    let scrollAmount = 0
    let autoplayInterval = null

    function slide(direction) {
      const slideWidth = slider.querySelector(".latest-match-card, .live-match-card").offsetWidth + 16 // 16px for gap
      scrollAmount += direction * slideWidth
      scrollAmount = Math.max(0, Math.min(scrollAmount, slider.scrollWidth - slider.clientWidth))
      slider.style.transform = `translateX(-${scrollAmount}px)`
    }

    prevButton.addEventListener("click", () => slide(-1))
    nextButton.addEventListener("click", () => slide(1))

    // Touch events for mobile swiping
    let touchStartX = 0
    let touchEndX = 0

    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX
      },
      { passive: true },
    )

    slider.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX
        if (touchStartX - touchEndX > 50) {
          slide(1)
        } else if (touchEndX - touchStartX > 50) {
          slide(-1)
        }
      },
      { passive: true },
    )

    // Autoplay functionality
    function startAutoplay() {
      // Check if autoplay is enabled via data attribute
      const autoplayEnabled = slider.dataset.autoplay !== "false"

      if (autoplayEnabled) {
        autoplayInterval = setInterval(() => {
          // Check if we've reached the end
          if (scrollAmount < slider.scrollWidth - slider.clientWidth) {
            slide(1)
          } else {
            // Reset to beginning
            scrollAmount = 0
            slider.style.transform = `translateX(0)`
          }
        }, 5000)
      }
    }

    // Start autoplay
    startAutoplay()

    // Stop autoplay on user interaction
    prevButton.addEventListener("click", () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval)
        startAutoplay()
      }
    })

    nextButton.addEventListener("click", () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval)
        startAutoplay()
      }
    })
  }

  initSlider(".featured-matches-slider")
  initSlider(".live-matches-slider")
})

