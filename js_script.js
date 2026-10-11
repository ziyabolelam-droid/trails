/* MalotiTrails shared JavaScript.
   This file contains the small interactive features used across the website. */

document.addEventListener("DOMContentLoaded", function () {
  // Feature 1: Dark/light mode. The user's choice is saved in localStorage.
  const themeButton = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("malotiTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  function updateThemeButton() {
    if (themeButton) {
      themeButton.textContent = document.body.classList.contains("dark-mode") ? "☀ Light mode" : "☾ Dark mode";
    }
  }
  updateThemeButton();

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("malotiTheme", theme);
      updateThemeButton();
    });
  }

  // Feature 2: Search and filter destination cards.
  const searchInput = document.getElementById("destinationSearch");
  const destinationItems = document.querySelectorAll(".destination-item");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const noResults = document.getElementById("noResults");
  let activeCategory = "all";

  function filterDestinations() {
    if (!searchInput) return;

    const searchWord = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    destinationItems.forEach(function (item) {
      const searchableText = (item.dataset.search + " " + item.textContent).toLowerCase();
      const categories = item.dataset.category.split(" ");
      const matchesSearch = searchableText.includes(searchWord);
      const matchesCategory = activeCategory === "all" || categories.includes(activeCategory);
      const shouldShow = matchesSearch && matchesCategory;

      item.classList.toggle("d-none", !shouldShow);
      if (shouldShow) visibleCount++;
    });

    if (noResults) noResults.classList.toggle("d-none", visibleCount !== 0);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterDestinations);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCategory = button.dataset.filter;
      filterButtons.forEach(function (otherButton) {
        otherButton.classList.toggle("active", otherButton === button);
      });
      filterDestinations();
    });
  });

  // Feature 3: Gallery preview, next/previous controls and Bootstrap modal.
  const galleryButtons = Array.from(document.querySelectorAll(".gallery-photo"));
  const galleryModalElement = document.getElementById("photoModal");
  let currentPhoto = 0;
  let photoModal = null;

  if (galleryModalElement && window.bootstrap) {
    photoModal = new bootstrap.Modal(galleryModalElement);
  }

  function showPhoto(index) {
    if (galleryButtons.length === 0) return;
    currentPhoto = (index + galleryButtons.length) % galleryButtons.length;

    const chosenPhoto = galleryButtons[currentPhoto];
    const fullImage = chosenPhoto.dataset.full;
    const caption = chosenPhoto.dataset.caption;
    const modalImage = document.getElementById("modalPhoto");
    const modalTitle = document.getElementById("photoModalTitle");
    const count = document.getElementById("galleryCount");

    if (modalImage) {
      modalImage.src = fullImage;
      modalImage.alt = caption;
    }
    if (modalTitle) modalTitle.textContent = caption;
    if (count) count.textContent = "Photo " + (currentPhoto + 1) + " of " + galleryButtons.length;
  }

  galleryButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      showPhoto(index);
      if (photoModal) photoModal.show();
    });
  });

  const previousPhoto = document.getElementById("previousPhoto");
  const nextPhoto = document.getElementById("nextPhoto");
  const modalPrevious = document.getElementById("modalPrevious");
  const modalNext = document.getElementById("modalNext");

  if (previousPhoto) previousPhoto.addEventListener("click", function () {
    showPhoto(currentPhoto - 1);
    if (photoModal) photoModal.show();
  });
  if (nextPhoto) nextPhoto.addEventListener("click", function () {
    showPhoto(currentPhoto + 1);
    if (photoModal) photoModal.show();
  });
  if (modalPrevious) modalPrevious.addEventListener("click", function () { showPhoto(currentPhoto - 1); });
  if (modalNext) modalNext.addEventListener("click", function () { showPhoto(currentPhoto + 1); });

  // Feature 4: Trip calculator. The values are examples, not real travel prices.
  const tripPeople = document.getElementById("tripPeople");
  const tripStyle = document.getElementById("tripStyle");
  const tripEstimate = document.getElementById("tripEstimate");

  function calculateTrip() {
    if (!tripPeople || !tripStyle || !tripEstimate) return;
    const people = Number(tripPeople.value) || 0;
    const pricePerPerson = Number(tripStyle.value) || 0;
    const total = people * pricePerPerson;
    tripEstimate.textContent = "M " + total.toLocaleString("en-US");
  }

  if (tripPeople) tripPeople.addEventListener("input", calculateTrip);
  if (tripStyle) tripStyle.addEventListener("change", calculateTrip);
  calculateTrip();

  // Helper function for the two forms.
  function showFormMessage(element, message, isSuccess) {
    if (!element) return;
    element.textContent = message;
    element.className = "form-feedback mt-3 " + (isSuccess ? "success" : "error");
  }

  // Feature 5: Booking form validation and a success message.
  const bookingForm = document.getElementById("bookingFormElement");
  const bookingFeedback = document.getElementById("bookingFeedback");
  const tripDate = document.getElementById("tripDate");

  if (tripDate) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    tripDate.min = localToday;
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("bookingName");
      const email = document.getElementById("bookingEmail");
      const phone = document.getElementById("bookingPhone");
      const destination = document.getElementById("tripDestination");
      const people = document.getElementById("tripPeople");

      if (tripDate && tripDate.value && tripDate.value < tripDate.min) {
        tripDate.setCustomValidity("Please choose today or a future date.");
      } else if (tripDate) {
        tripDate.setCustomValidity("");
      }

      const formIsValid = bookingForm.checkValidity() &&
        name.value.trim().length >= 2 &&
        Number(people.value) >= 1 && Number(people.value) <= 30;

      bookingForm.classList.add("was-validated");

      if (!formIsValid) {
        showFormMessage(bookingFeedback, "Please check the highlighted fields and correct them before submitting.", false);
        return;
      }

      // Save a small, non-sensitive trip summary to this browser.
      const tripSummary = {
        name: name.value.trim(),
        destination: destination.value,
        date: tripDate.value,
        travellers: Number(people.value),
        estimate: tripEstimate ? tripEstimate.textContent : ""
      };
      localStorage.setItem("malotiLastTrip", JSON.stringify(tripSummary));

      showFormMessage(
        bookingFeedback,
        "Thanks, " + name.value.trim() + "! Your sample enquiry has been saved in this browser. This is not a real booking confirmation.",
        true
      );
      bookingForm.reset();
      bookingForm.classList.remove("was-validated");
      calculateTrip();
    });
  }

  // Feature 6: Contact form validation.
  const contactForm = document.getElementById("contactForm");
  const contactFeedback = document.getElementById("contactFeedback");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("contactName");
      const message = document.getElementById("contactMessage");

      const formIsValid = contactForm.checkValidity() &&
        name.value.trim().length >= 2 &&
        message.value.trim().length >= 10;

      contactForm.classList.add("was-validated");

      if (!formIsValid) {
        showFormMessage(contactFeedback, "Please complete the highlighted fields. Your message should have at least 10 characters.", false);
        return;
      }

      showFormMessage(contactFeedback, "Thank you, " + name.value.trim() + "! Your demo message passed validation. It has not been emailed to anyone.", true);
      contactForm.reset();
      contactForm.classList.remove("was-validated");
    });
  }
});
