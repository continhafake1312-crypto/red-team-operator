document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const feedbackButton = document.getElementById("feedback-button")
  const feedbackWidget = document.getElementById("feedback-widget")
  const closeButton = document.getElementById("feedback-close")
  const feedbackForm = document.getElementById("feedback-form")
  const feedbackType = document.getElementById("feedback-type")
  const feedbackTypeFields = document.querySelectorAll(".feedback-type-field")
  const ratingStars = document.querySelectorAll(".rating-star")
  const ratingValue = document.getElementById("rating-value")
  const feedbackSuccess = document.getElementById("feedback-success")
  const feedbackError = document.getElementById("feedback-error")

  // Toggle feedback widget visibility
  feedbackButton.addEventListener("click", () => {
    feedbackWidget.classList.toggle("active")
    feedbackButton.classList.toggle("active")

    // Reset form when opening
    if (feedbackWidget.classList.contains("active")) {
      resetForm()
    }
  })

  // Close feedback widget
  closeButton.addEventListener("click", () => {
    feedbackWidget.classList.remove("active")
    feedbackButton.classList.remove("active")
  })

  // Handle feedback type change
  feedbackType.addEventListener("change", function () {
    const selectedType = this.value

    // Hide all type-specific fields
    feedbackTypeFields.forEach((field) => {
      field.style.display = "none"
    })

    // Show the selected type field
    if (selectedType) {
      document.getElementById(`feedback-${selectedType}-fields`).style.display = "block"
    }
  })

  // Handle star rating
  ratingStars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = Number.parseInt(this.getAttribute("data-value"))
      ratingValue.value = value

      // Update star appearance
      ratingStars.forEach((s) => {
        const starValue = Number.parseInt(s.getAttribute("data-value"))
        if (starValue <= value) {
          s.classList.add("active")
        } else {
          s.classList.remove("active")
        }
      })
    })

    // Hover effects
    star.addEventListener("mouseenter", function () {
      const value = Number.parseInt(this.getAttribute("data-value"))

      ratingStars.forEach((s) => {
        const starValue = Number.parseInt(s.getAttribute("data-value"))
        if (starValue <= value) {
          s.classList.add("hover")
        }
      })
    })

    star.addEventListener("mouseleave", () => {
      ratingStars.forEach((s) => {
        s.classList.remove("hover")
      })
    })
  })

  // Handle form submission
  feedbackForm.addEventListener("submit", function (e) {
    e.preventDefault()

    // Show loading state
    const submitButton = this.querySelector("button[type='submit']")
    const originalText = submitButton.textContent
    submitButton.textContent = "Enviando..."
    submitButton.disabled = true

    // Get form data
    const formData = new FormData(this)

    // Send AJAX request
    fetch(feedbackForm.getAttribute("action"), {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        submitButton.textContent = originalText
        submitButton.disabled = false

        if (data.success) {
          // Show success message
          feedbackSuccess.style.display = "block"
          feedbackForm.style.display = "none"

          // Reset and close after delay
          setTimeout(() => {
            resetForm()
            feedbackWidget.classList.remove("active")
            feedbackButton.classList.remove("active")
          }, 3000)
        } else {
          // Show error message
          feedbackError.style.display = "block"
          feedbackError.textContent = data.message || "Ocorreu um erro. Tente novamente."

          setTimeout(() => {
            feedbackError.style.display = "none"
          }, 3000)
        }
      })
      .catch((error) => {
        submitButton.textContent = originalText
        submitButton.disabled = false

        // Show error message
        feedbackError.style.display = "block"
        feedbackError.textContent = "Ocorreu um erro na conexão. Tente novamente."

        setTimeout(() => {
          feedbackError.style.display = "none"
        }, 3000)
      })
  })

  // Reset form function
  function resetForm() {
    feedbackForm.reset()
    feedbackSuccess.style.display = "none"
    feedbackError.style.display = "none"
    feedbackForm.style.display = "block"

    // Reset type fields
    feedbackTypeFields.forEach((field) => {
      field.style.display = "none"
    })

    // Reset stars
    ratingStars.forEach((star) => {
      star.classList.remove("active")
    })
    ratingValue.value = ""
  }
})