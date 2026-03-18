// import api
import { getUnits, saveHistory } from "./api.js";

// global state
const state = {
  type: "length",
  action: "conversion",
  fromVal: null,
  fromUnit: "",
  toVal: null,
  toUnit: "",
  operator: "+"
};

// dom load
document.addEventListener("DOMContentLoaded", async () => {

  try {
    attachEventListeners();
    setActiveDefaults();
    toggleOperators(false);

    await loadUnits("length");
    
    await saveHistory({ // temporary testing function
      type: "length",
      action: "conversion",
      expression: "1 km → 1000 m",
      result: 1000,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(error);
    showError("Server unavailable");
  }
});

// load units
async function loadUnits(type) {
  try {
    const units = await getUnits(type);

    const fromDropdown = document.getElementById("fromUnit");
    const toDropdown = document.getElementById("toUnit");

    fromDropdown.innerHTML = "";
    toDropdown.innerHTML = "";

    units.forEach(unit => {
      const option1 = document.createElement("option");
      option1.value = unit.symbol;
      option1.textContent = `${unit.label} (${unit.symbol})`;

      const option2 = option1.cloneNode(true);

      fromDropdown.appendChild(option1);
      toDropdown.appendChild(option2);
    });

    if (units.length > 0) {
      state.fromUnit = units[0].symbol;
      state.toUnit = units[1]?.symbol || units[0].symbol;
    }

  } catch (error) {
    console.error(error);
    showError("Failed to load units");
  }
}

// event listners
function attachEventListeners() {
  const typeCards = document.querySelectorAll(".type-card");

  typeCards.forEach(card => {
    card.addEventListener("click", async () => {
      document.querySelectorAll(".type-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      state.type = card.dataset.type;

      await loadUnits(state.type);
    });
  });
}

// ui helpers
function toggleOperators(show) {
  const operatorRow = document.getElementById("operatorRow");
  if (!operatorRow) return;

  operatorRow.style.display = show ? "block" : "none";
}

function setActiveDefaults() {
  const firstType = document.querySelector(".type-card");
  if (firstType) firstType.classList.add("active");
}

function showError(message) {
  const errorBanner = document.getElementById("errorBanner");
  if (!errorBanner) return;

  errorBanner.textContent = message;
  errorBanner.classList.remove("d-none");
}