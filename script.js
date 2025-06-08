document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element References ---
  const caseListContainer = document.getElementById("case-list");
  const caseCountElement = document.getElementById("case-count");
  const searchInput = document.getElementById("search");
  const clearSearchBtn = document.getElementById("clear-search");
  const newCaseForm = document.getElementById("new-case-form");
  const loader = document.getElementById("loader");
  const noResultsElement = document.getElementById("no-results");

  // --- State Management ---
  let allCases = []; // Holds all cases fetched from the JSON file.

  // --- Core Functions ---

  /**
   * Fetches case data from the server (or local file).
   * Implements error handling and displays loading state.
   */
  async function loadCases() {
    try {
      loader.style.display = "block"; // Show loader
      const res = await fetch('data/cases.json');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      allCases = data;
      renderCases(allCases); // Initial render
    } catch (error) {
      caseListContainer.innerHTML = `<p class="error">Failed to load case data. Please try again later.</p>`;
      console.error("Error loading cases:", error);
    } finally {
      loader.style.display = "none"; // Hide loader
    }
  }

  /**
   * Renders an array of case objects to the DOM.
   * @param {Array} cases - The array of case objects to render.
   */
  function renderCases(cases) {
    caseListContainer.innerHTML = ""; // Clear existing list

    if (cases.length === 0) {
        noResultsElement.style.display = 'block';
    } else {
        noResultsElement.style.display = 'none';
    }

    cases.forEach(entry => {
      const caseElement = createCaseElement(entry);
      caseListContainer.appendChild(caseElement);
    });

    // Update the count of displayed cases.
    updateCaseCount(cases.length, allCases.length);
  }

  /**
   * Creates an HTML element for a single case.
   * @param {Object} entry - The case object.
   * @returns {HTMLElement} - The created DOM element for the case.
   */
  function createCaseElement(entry) {
      const div = document.createElement("div");
      div.className = "case";
      div.innerHTML = `
        <h3>${escapeHTML(entry.company)}</h3>
        <p>${escapeHTML(entry.description)}</p>
        <p><a href="${escapeHTML(entry.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a></p>
        <div class="tags">${entry.manipulationType.map(tag => `<span>${escapeHTML(tag)}</span>`).join(" ")}</div>
        <small class="case-date">Reported: ${escapeHTML(entry.reportedDate)}</small>
      `;
      return div;
  }

  /**
   * Filters cases based on a search term and re-renders the list.
   * @param {string} filter - The search term.
   */
  function filterAndRender(filter) {
    const lowercasedFilter = filter.toLowerCase();
    const filtered = allCases.filter(c =>
      c.company.toLowerCase().includes(lowercasedFilter) ||
      c.description.toLowerCase().includes(lowercasedFilter) ||
      c.manipulationType.join(",").toLowerCase().includes(lowercasedFilter)
    );
    renderCases(filtered);
  }

  /**
   * Updates the text displaying the number of visible cases.
   * @param {number} displayedCount - Number of cases currently displayed.
   * @param {number} totalCount - Total number of cases loaded.
   */
  function updateCaseCount(displayedCount, totalCount) {
    if (searchInput.value) {
        caseCountElement.textContent = `Displaying ${displayedCount} of ${totalCount} cases.`;
    } else {
        caseCountElement.textContent = `Showing all ${totalCount} cases.`;
    }
  }

  // --- Event Handlers ---

  /**
   * Handles the submission of the new case form.
   * @param {Event} event - The form submission event.
   */
  function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const newCompany = document.getElementById("new-company").value;
    const newDescription = document.getElementById("new-description").value;
    const newSourceUrl = document.getElementById("new-source-url").value;
    const newManipulationTypes = document.getElementById("new-manipulation-type").value
                                   .split(',')
                                   .map(tag => tag.trim())
                                   .filter(tag => tag !== '');

    // Create a new case object
    const newCase = {
      company: newCompany,
      description: newDescription,
      sourceUrl: newSourceUrl,
      manipulationType: newManipulationTypes,
      reportedDate: new Date().toISOString().slice(0, 10) // Current date in YYYY-MM-DD format
    };

    // Add the new case to the start of our allCases array
    allCases.unshift(newCase);

    // Re-render cases, applying any current filter
    filterAndRender(searchInput.value);

    // Provide user feedback and clear the form
    alert("Case added to the display! (Note: This is a front-end demo and will not be saved permanently.)");
    newCaseForm.reset();
  }

  // --- Utility Functions ---

  /**
   * Escapes HTML to prevent XSS attacks.
   * @param {string} str - The string to escape.
   * @returns {string} - The escaped string.
   */
  function escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  // --- Event Listeners ---
  searchInput.addEventListener("input", e => filterAndRender(e.target.value));
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterAndRender("");
  });
  newCaseForm.addEventListener("submit", handleFormSubmit);

  // --- Initial Load ---
  loadCases();
});
