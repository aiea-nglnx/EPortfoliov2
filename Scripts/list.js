class AnimatedList {
  constructor({
    container,
    items = [],
    onItemSelect = null,
    showGradients = true,
    enableArrowNavigation = true,
    displayScrollbar = true,
    initialSelectedIndex = -1,
  }) {
    this.container = container;
    this.items = items;
    this.onItemSelect = onItemSelect;
    this.showGradients = showGradients;
    this.enableArrowNavigation = enableArrowNavigation;
    this.displayScrollbar = displayScrollbar;
    this.selectedIndex = initialSelectedIndex;
    this.keyboardNav = false;
    this.openIndex = -1; // track which item is open

    this.render();
    this.attachHandlers();
  }

  render() {
    this.container.classList.add("scroll-list-container");

    // Scroll area
    this.scrollList = document.createElement("div");
    this.scrollList.className = `scroll-list ${!this.displayScrollbar ? "no-scrollbar" : ""}`;
    this.container.appendChild(this.scrollList);

    // Items
    this.items.forEach((item, index) => {
      const label = typeof item === "string" ? item : item.title;
      const body = typeof item === "string" ? "" : (item.body || "");

      const itemDiv = document.createElement("div");
      itemDiv.className = `item${this.selectedIndex === index ? " selected" : ""}`;
      itemDiv.setAttribute("data-index", index);
      itemDiv.style.opacity = "0";
      itemDiv.style.transform = "scale(0.7)";

      itemDiv.innerHTML = `
        <div class="item-header">
          <p class="item-text">${label}</p>
          <span class="item-arrow">▾</span>
        </div>
        <div class="item-body">
          ${body}
        </div>
      `;

      // Animate in when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            itemDiv.animate(
              [
                { transform: "scale(0.7)", opacity: 0 },
                { transform: "scale(1)", opacity: 1 },
              ],
              { duration: 200, fill: "forwards", delay: 100 }
            );
          }
        });
      }, { threshold: 0.5 });

      observer.observe(itemDiv);

      // Hover selection
      itemDiv.addEventListener("mouseenter", () => this.handleItemMouseEnter(index));

      // Click: select + toggle open
      itemDiv.addEventListener("click", () => this.handleItemClick(item, index));

      this.scrollList.appendChild(itemDiv);
    });

    // Gradient overlays
    if (this.showGradients) {
      this.topGradient = document.createElement("div");
      this.topGradient.className = "top-gradient";
      this.topGradient.style.opacity = "0";
      this.container.appendChild(this.topGradient);

      this.bottomGradient = document.createElement("div");
      this.bottomGradient.className = "bottom-gradient";
      this.bottomGradient.style.opacity = "1";
      this.container.appendChild(this.bottomGradient);
    }

    // If you want the initial selected to be open too
    if (this.selectedIndex >= 0) {
      this.openIndex = this.selectedIndex;
      this.updateOpened();
    }
  }

  attachHandlers() {
    this.scrollList.addEventListener("scroll", (e) => this.handleScroll(e));

    if (this.enableArrowNavigation) {
      window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }
  }

  handleItemMouseEnter(index) {
    this.selectedIndex = index;
    this.updateSelected();
  }

  handleItemClick(item, index) {
    // selection
    this.selectedIndex = index;

    // toggle open/close
    this.openIndex = this.openIndex === index ? -1 : index;

    this.updateSelected();
    this.updateOpened();

    if (this.onItemSelect) this.onItemSelect(item, index);
  }

  handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const topOpacity = Math.min(scrollTop / 50, 1);
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    const bottomOpacity = scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1);

    if (this.topGradient) this.topGradient.style.opacity = topOpacity;
    if (this.bottomGradient) this.bottomGradient.style.opacity = bottomOpacity;
  }

  handleKeyDown(e) {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      this.keyboardNav = true;
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.items.length - 1);
      this.scrollToSelected();
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      this.keyboardNav = true;
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.scrollToSelected();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (this.selectedIndex >= 0 && this.onItemSelect) {
        this.onItemSelect(this.items[this.selectedIndex], this.selectedIndex);
      }
      // Optional: pressing Enter toggles open state too
      if (this.selectedIndex >= 0) {
        this.openIndex = this.openIndex === this.selectedIndex ? -1 : this.selectedIndex;
        this.updateOpened();
      }
    }
    this.updateSelected();
  }

  scrollToSelected() {
    if (!this.scrollList) return;
    const selectedItem = this.scrollList.querySelector(`[data-index="${this.selectedIndex}"]`);
    if (!selectedItem) return;
    const extraMargin = 50;
    const container = this.scrollList;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;

    if (itemTop < container.scrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
    } else if (itemBottom > container.scrollTop + container.clientHeight - extraMargin) {
      container.scrollTo({ top: itemBottom - container.clientHeight + extraMargin, behavior: "smooth" });
    }
  }

  updateSelected() {
    this.scrollList.querySelectorAll(".item").forEach((el, i) => {
      el.classList.toggle("selected", i === this.selectedIndex);
    });
  }

  updateOpened() {
    this.scrollList.querySelectorAll(".item").forEach((el, i) => {
      el.classList.toggle("open", i === this.openIndex);
    });
  }
}

// Example items (title + body)
const items = [
  {
    title: "Leadership & Responsibility",
    body: "<p>Demonstrates consistent management: <ul><li>Consistently made the bi-weekly general meeting slides</li><br><li>Maintained inner organization for member leadership (e.g. Social & Service Committees</li><li></li></ul></p>"
  },
  {
    title: "Technical Excellence",
    body: "<p>Seeks to recognize , encourage, inspire, and promote among students. <ul><li><b>Skill Development:</b> Show proficiency and outstanding techical skills</li></ul></p>"
  },
  {
    title: "Service & Community",
    body: "<p>Actively contributes to the Waipahu community.</p>"
  },
  {
    title: "Eligibility & Academic Standing",
    body: "<p>Met and maintain all NTHS requirements prior to final selection and final membership. <ul><li>3.5+ Cummulative GPA</li><li>3.0+ CTE GPA</li><li>2 Years of CTE Met</li><li>80% of Teachers Recommended (6/7 teacher)</li></ul></p>"
  },
  { 
    title: "Existing Chapter", 
    body: "<p>There are only 2 existing & active NTHS chapters in the state of Hawai'i. <ul><li>Waimea</li><li>Waipahu</li></ul></p>" 
  },
  { 
    title: "Core 4: Career Development", 
    body: "<p>Help members build employability skills, explore career paths, and connect with employers</p>" 
  },
  { 
    title: "Core 4: Leadership", 
    body: "<p>Opportunities for members to develop leadership qualities, take initative, and responsibility.</p>" 
  },
  { 
    title: "Core 4: Service", 
    body: "<p>Community engagement through project that utilize CTE skills.</p>" 
  },
  { 
    title: "Core 4: Recognition", 
    body: "<p>Formal acknowledgment of student achievements through induction ceremonies, celebrating success in CTE.</p>" 
  },
];

new AnimatedList({
  container: document.getElementById("animatedList"),
  items,
  onItemSelect: (item, index) => console.log("Selected:", item, index),
  showGradients: true,
  enableArrowNavigation: true,
  displayScrollbar: true,
});
