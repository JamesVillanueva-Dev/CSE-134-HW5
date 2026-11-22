// fact-panel.js: the <fact-panel> Web Component (Homework 5, Part 1).
//
// Loaded on projects.html with <script src="fact-panel.js" defer>.
// "defer" downloads the file while the HTML is parsed, then runs it
// once parsing is done, so every element on the page already exists
// when this code runs. No DOMContentLoaded listener is needed.
//
// The component shows one "useless fact" at a time. In Part 1 the facts
// come from SAMPLE_FACTS below. In Part 2 they'll come from the Useless
// Facts API, which returns objects with the same "text" and "source"
// fields, so showFact(fact) can be reused as it is.
//
// No Shadow DOM: the component puts its elements straight into the page,
// so the normal rules in styles.css style them.

// ---------------------------------------------------------------------
// 1. Sample data
// ---------------------------------------------------------------------

// An array of objects shaped like the API's response: { text, source }.
// const means this variable can't be reassigned to a different array.
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

    // Which sample fact is showing: 0 = first, 1 = second, 2 = third.
    this.currentIndex = 0;

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
    // never as HTML, which is why innerHTML isn't used anywhere.

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
    // it, then Enter or Space to press it.
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "Next fact";

    // Status message, like "Fact 2 of 3". role="status" makes it a
    // polite live region: when its text changes, screen readers read
    // the new text out without moving the user's focus.
    this.statusParagraph = document.createElement("p");
    this.statusParagraph.setAttribute("role", "status");

    // When the button is clicked (or pressed with Enter/Space), show
    // the next fact. % (remainder) wraps back to 0 after the last fact:
    // with 3 facts, (2 + 1) % 3 is 0, so fact 3 is followed by fact 1.
    // An arrow function is used so "this" still means the component
    // inside it (a regular function would get the button as "this").
    nextButton.addEventListener("click", () => {
      const nextIndex = (this.currentIndex + 1) % SAMPLE_FACTS.length;
      this.showSampleFact(nextIndex);
    });

    // Fill in the first fact BEFORE the elements go on the page. The
    // status text is then already there when the live region appears,
    // so screen readers don't announce "Fact 1 of 3" on page load.
    this.showSampleFact(0);

    // Apply the compact attribute in case the HTML already had it.
    this.updateCompactView();

    // appendChild() adds each element as the last child of this
    // <fact-panel>, so they appear in this order on the page.
    this.appendChild(heading);
    this.appendChild(this.factParagraph);
    this.appendChild(this.sourceParagraph);
    this.appendChild(nextButton);
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

  // Shows one sample fact by its position in SAMPLE_FACTS, and updates
  // the status message to say which one it is.
  showSampleFact(index) {
    this.currentIndex = index;
    this.showFact(SAMPLE_FACTS[index]);

    // A template literal (backticks) puts the values of ${...} into the
    // text. index starts at 0, so add 1 for a human-friendly number.
    this.statusParagraph.textContent =
      `Fact ${index + 1} of ${SAMPLE_FACTS.length}`;
  }

  // Puts one fact on screen. "fact" is an object like
  // { text: "...", source: "..." }, the same shape the Useless Facts
  // API returns, so Part 2 can pass API data straight in.
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
