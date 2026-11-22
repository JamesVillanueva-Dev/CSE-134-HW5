// fact-panel.js: the <fact-panel> Web Component (Homework 5, Parts 1-2).
//
// Loaded on projects.html with <script src="fact-panel.js" defer>.
// "defer" downloads the file while the HTML is parsed, then runs it
// once parsing is done, so every element on the page already exists
// when this code runs. No DOMContentLoaded listener is needed.
//
// The component shows one "useless fact" at a time. On page load it
// shows a built-in sample fact, so the panel has content even if the API
// is down. The "Get a new fact" button then loads a random fact from the
// Useless Facts API with fetch(), without reloading the page.
//
// No Shadow DOM: the component puts its elements straight into the page,
// so the normal rules in styles.css style them.

// ---------------------------------------------------------------------
// 1. Settings and sample data
// ---------------------------------------------------------------------

// The API address. "?language=en" asks for an English fact.
const API_URL = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";

// An array of objects shaped like the API's response: { text, source }.
// const means this variable can't be reassigned to a different array.
// Only the first one is shown now (on page load); the others are left
// over from Part 1, where "Next fact" cycled through all three.
const SAMPLE_FACTS = [
  { text: "Octopuses have three hearts.", source: "sample data" },
  { text: "Bananas are berries, but strawberries aren't.", source: "sample data" },
  { text: "A group of flamingos is called a flamboyance.", source: "sample data" },
];

// ---------------------------------------------------------------------
// 2. The component class
// ---------------------------------------------------------------------

// "extends HTMLElement" makes FactPanel a new kind of HTML element.
// It gets everything a normal element has (appendChild, hasAttribute,
// addEventListener...) and adds the methods below.
class FactPanel extends HTMLElement {
  // The browser only calls attributeChangedCallback() for attributes
  // listed here. "static" means it belongs to the class itself, not to
  // each <fact-panel> on the page.
  // (Older code writes the same thing as a getter:
  //   static get observedAttributes() { return ["compact"]; } )
  static observedAttributes = ["compact"];

  // Runs when a FactPanel is created, before it's on the page. Only
  // set up starting values here; building the interface waits for
  // connectedCallback().
  constructor() {
    // super() runs HTMLElement's constructor first. It's required in
    // any class that extends another one, before "this" can be used.
    super();

    // True while a request to the API is waiting for an answer. Used to
    // ignore extra clicks so only one request runs at a time.
    this.isLoading = false;

    // Becomes true once the interface is built (see connectedCallback).
    this.isBuilt = false;
  }

  // Runs every time the element is added to the page. That can happen
  // more than once (for example if the element is moved), so the
  // isBuilt flag makes sure the interface is only built the first time.
  connectedCallback() {
    if (this.isBuilt) {
      return; // already built: stop here so nothing gets duplicated
    }
    this.isBuilt = true;

    // Build each piece with document.createElement() and set its text
    // with textContent. textContent treats the value as plain text,
    // never as HTML, which is why innerHTML isn't used anywhere. That
    // matters even more now: the fact comes from another website, and
    // textContent means any "<tags>" in it just show up as text.

    // Heading. It's an h2 because projects.html has one h1 ("Projects")
    // and each section under it, like the project cards, uses an h2.
    const heading = document.createElement("h2");
    heading.textContent = "Random useless fact";

    // Paragraph for the fact itself. Saved on "this" so other methods
    // (like showFact) can change its text later.
    this.factParagraph = document.createElement("p");
    this.factParagraph.className = "fact-text"; // hook for styles.css

    // Paragraph for where the fact came from. Compact view hides it.
    this.sourceParagraph = document.createElement("p");
    this.sourceParagraph.className = "fact-source";

    // The control. type="button" means it never tries to submit a form.
    // A native <button> already works with the keyboard: Tab to reach
    // it, then Enter or Space to press it. Saved on "this" because
    // loadFact() changes its text and its aria-disabled attribute.
    this.fetchButton = document.createElement("button");
    this.fetchButton.type = "button";
    this.fetchButton.textContent = "Get a new fact";

    // Status message, like "Loading a new fact…". role="status" makes it
    // a polite live region: when its text changes, screen readers read
    // the new text out without moving the user's focus.
    this.statusParagraph = document.createElement("p");
    this.statusParagraph.setAttribute("role", "status");

    // When the button is clicked (or pressed with Enter/Space), ask the
    // API for a new fact. An arrow function is used so "this" still
    // means the component inside it (a regular function would get the
    // button as "this").
    this.fetchButton.addEventListener("click", () => {
      this.loadFact();
    });

    // Fill in the first sample fact BEFORE the elements go on the page.
    // The status text is then already there when the live region
    // appears, so screen readers don't announce it on page load.
    this.showFact(SAMPLE_FACTS[0]);
    this.statusParagraph.textContent = "Showing a sample fact.";

    // Apply the compact attribute in case the HTML already had it.
    this.updateCompactView();

    // appendChild() adds each element as the last child of this
    // <fact-panel>, so they appear in this order on the page.
    this.appendChild(heading);
    this.appendChild(this.factParagraph);
    this.appendChild(this.sourceParagraph);
    this.appendChild(this.fetchButton);
    this.appendChild(this.statusParagraph);
  }

  // Runs when an attribute listed in observedAttributes is added,
  // removed or changed. The browser passes in the attribute's name, its
  // old value and its new value (null means "not present").
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "compact") {
      this.updateCompactView();
    }
  }

  // Shows or hides the source line to match the compact attribute.
  // Only the source line changes, so the fact that was showing stays.
  updateCompactView() {
    // If the HTML already has <fact-panel compact>, this method runs
    // (from attributeChangedCallback) BEFORE connectedCallback has
    // built anything, so there's no source paragraph yet. Stop here;
    // connectedCallback calls this method again once it exists.
    if (!this.sourceParagraph) {
      return;
    }

    // The hidden property mirrors the hidden HTML attribute:
    // true hides the paragraph, false shows it again.
    // hasAttribute("compact") is true when compact is on.
    this.sourceParagraph.hidden = this.hasAttribute("compact");
  }

  // Asks the Useless Facts API for a random fact and shows it.
  //
  // "async" lets this method use "await", which pauses the method until
  // a slow step (like the network request) finishes, without freezing
  // the page. Everything that can fail is inside "try"; if any step
  // throws an error, the code jumps straight to "catch".
  async loadFact() {
    // A request is already running: ignore this click.
    if (this.isLoading) {
      return;
    }

    // Start of the request. isLoading is set right away (before any
    // await), so a second click a moment later is already ignored.
    this.isLoading = true;

    // aria-disabled="true" tells screen readers the button is
    // unavailable, and styles.css greys it out. Unlike the disabled
    // property, it doesn't take keyboard focus off the button, so a
    // keyboard user stays where they were.
    this.fetchButton.setAttribute("aria-disabled", "true");
    this.statusParagraph.textContent = "Loading a new fact…";

    try {
      // fetch() sends the request. await waits for the response headers.
      // - headers: Accept asks the server to answer with JSON.
      // - signal: AbortSignal.timeout(10000) cancels the request if it
      //   takes longer than 10,000 ms (10 seconds), which throws an error.
      // If the network is down, fetch() itself throws an error.
      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      // response.ok is true only for HTTP statuses 200-299. A 404 or 500
      // doesn't make fetch() throw, so check it and throw our own error.
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      // Read the body and turn the JSON text into a JavaScript object.
      // If the body isn't valid JSON, response.json() throws an error.
      const data = await response.json();

      // Check the fields before showing anything. ?. (optional chaining)
      // gives undefined instead of crashing if data is null. The fact
      // text must be a string that isn't empty (trim() removes spaces
      // from both ends, so "   " counts as empty).
      if (typeof data?.text !== "string" || data.text.trim() === "") {
        throw new Error("The response has no fact text.");
      }

      // Use the API's source only if it's a non-empty string. Otherwise
      // keep this fallback, which shows as "Source: Useless Facts API".
      let source = "Useless Facts API";
      if (typeof data.source === "string" && data.source.trim() !== "") {
        source = data.source.trim();
      }

      // Success: show the fact with the same method the sample fact
      // uses. showFact() uses textContent, so the API's text is shown
      // as plain text, never run as HTML.
      this.showFact({ text: data.text.trim(), source: source });

      // Replace any old error message, and change "Try again" back.
      this.statusParagraph.textContent = "New fact loaded.";
      this.fetchButton.textContent = "Get a new fact";
    } catch (error) {
      // Any failure lands here: no network, timeout, bad HTTP status,
      // invalid JSON, or missing text. The last fact stays on screen,
      // because showFact() never ran.

      // Log the details for the developer (visible in the console).
      console.error("Couldn't load a fact from the API:", error);

      // Tell the visitor in plain words, and offer a retry.
      this.statusParagraph.textContent =
        "Couldn't load a new fact. Check your connection and press Try again.";
      this.fetchButton.textContent = "Try again";
    } finally {
      // "finally" runs after try OR catch, whichever happened, so the
      // button always becomes usable again after either outcome.
      this.isLoading = false;
      this.fetchButton.removeAttribute("aria-disabled");
    }
  }

  // Puts one fact on screen. "fact" is an object like
  // { text: "...", source: "..." }. Used for both the sample fact on
  // page load and the facts loaded from the API.
  showFact(fact) {
    this.factParagraph.textContent = fact.text;
    this.sourceParagraph.textContent = `Source: ${fact.source}`;
  }
}

// Register the class under a tag name. Custom element names must
// contain a hyphen, which keeps them from clashing with built-in tags.
// From here on, every <fact-panel> on the page is a FactPanel, and
// connectedCallback runs for the one already in projects.html.
customElements.define("fact-panel", FactPanel);

// ---------------------------------------------------------------------
// 3. The "Compact view" button (outside the component)
// ---------------------------------------------------------------------

const compactToggle = document.getElementById("compact-toggle");
const factPanel = document.querySelector("fact-panel");

// Only set up the button if both elements are on this page.
if (compactToggle && factPanel) {
  // The button starts with the hidden attribute in the HTML, so it never
  // shows when JavaScript is off (where it couldn't do anything).
  // JavaScript is running, so reveal it.
  compactToggle.hidden = false;

  // Start aria-pressed in sync with the panel ("true" = compact is on).
  compactToggle.setAttribute(
    "aria-pressed",
    String(factPanel.hasAttribute("compact"))
  );

  compactToggle.addEventListener("click", () => {
    // toggleAttribute("compact") adds the attribute if it's missing and
    // removes it if it's there. It returns true if the attribute is now
    // present, false if it was just removed. The change triggers the
    // panel's attributeChangedCallback.
    const isCompact = factPanel.toggleAttribute("compact");

    // aria-pressed tells screen readers whether the toggle is on.
    // String() turns true/false into "true"/"false".
    compactToggle.setAttribute("aria-pressed", String(isCompact));
  });
}
