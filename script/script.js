// import api
import { getUnits, getConversion, saveHistory, getHistory } from "./api.js";

// global state
const state = {
  type: "length",
  action: "conversion", // tracks which tab is active
};

// dom load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    attachEventListeners();
    setActiveDefaults();
    toggleOperators(false);
    await loadUnits("length");
    await loadHistory();
  } catch (error) {
    console.error(error);
    showError("Server unavailable");
  }
});

// event listeners
function attachEventListeners() {
  // Feature Cards (Length, Weight, etc.)
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach(card => {
    card.addEventListener("click", async () => {
      document.querySelectorAll(".feature-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      state.type = card.querySelector("h5").textContent.toLowerCase();
      await loadUnits(state.type);
    });
  });

  // Action Tabs
  document.getElementById("tab-conversion").addEventListener("click", () => switchAction("conversion"));
  document.getElementById("tab-comparison").addEventListener("click", () => switchAction("comparison"));
  document.getElementById("tab-arithmetic").addEventListener("click", () => switchAction("arithmetic"));

  // Main Submit Button
  document.getElementById("submitBtn").addEventListener("click", handleAction);
}

// Action Tab Switcher (Unlocks/Locks inputs)

// Action Tab Switcher (Unlocks/Locks inputs & toggles operators)
function switchAction(newAction) {
  state.action = newAction;

  // Update Tab Styling
  ["conversion", "comparison", "arithmetic"].forEach(act => {
    const tab = document.getElementById(`tab-${act}`);
    if(act === newAction) {
      tab.classList.replace("btn-light", "btn-primary");
      tab.classList.add("active");
    } else {
      tab.classList.replace("btn-primary", "btn-light");
      tab.classList.remove("active");
    }
  });

  // Show operators ONLY for arithmetic
  toggleOperators(newAction === "arithmetic");

  // Toggle 'toValue' readOnly state
  const toValueInput = document.getElementById("toValue");
  if (newAction === "conversion") {
    toValueInput.readOnly = true;
    toValueInput.value = "";
    toValueInput.placeholder = "Result";
  } else {
    toValueInput.readOnly = false;
    toValueInput.value = "";
    toValueInput.placeholder = "Enter second value";
  }

  // Clear UI
  document.getElementById("resultText").textContent = "Result will appear here";
  document.getElementById("errorBanner").classList.add("d-none");
}


// Main Router (Routes Submit button to the right function)
async function handleAction() {
  document.getElementById("errorBanner").classList.add("d-none"); // Clear old errors

  if (state.action === "conversion") {
    await performConversion();
  } else if (state.action === "comparison") {
    await performComparison();
  } else if (state.action === "arithmetic") {
    showError("Arithmetic coming soon!");
  }
}

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
  } catch (error) {
    showError("Failed to load units");
  }
}

// load history
async function loadHistory() {
  try {
    const history = await getHistory();
    const container = document.getElementById("history");
    container.innerHTML = "";

    if (!history.length) {
      container.innerHTML = "<p>No history yet.</p>";
      return;
    }

    history.forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.textContent = item.expression;
      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
  }
}

// UC-JS-07: Apply Conversion Logic
function applyConversion(value, convObj, fromUnit, toUnit) {
  if (isNaN(value)) throw new Error("Invalid number");
  if (fromUnit === toUnit) return value;

  try {
    if (convObj.factor !== null) {
      return parseFloat((value * convObj.factor).toFixed(6));
    } else {
      const expr = convObj.formula.replace("x", value);
      return parseFloat(eval(expr).toFixed(6));
    }
  } catch (error) {
    throw new Error("Bad formula");
  }
}

// UC-JS-08: Compare Values Logic
function compareValues(v1, u1, v2, u2, base1, base2) {
  if (isNaN(v1) || isNaN(v2)) return "Invalid values — cannot compare";
  
  if (u1 === u2) {
    if (v1 > v2) return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
    if (v1 < v2) return `${v1} ${u1} is LESS than ${v2} ${u2}`;
    return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
  }

  if (base1 > base2) return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
  if (base1 < base2) return `${v1} ${u1} is LESS than ${v2} ${u2}`;
  return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
}

// Perform Conversion (Action 1)
async function performConversion() {
  const fromValStr = document.getElementById("fromValue").value;
  const fromUnit = document.getElementById("fromUnit").value;
  const toUnit = document.getElementById("toUnit").value;

  if (!fromValStr) return;

  const fromVal = parseFloat(fromValStr);

  try {
    let result;
    if (fromUnit === toUnit) {
      result = fromVal;
    } else {
      const conversion = await getConversion(fromUnit, toUnit);
      result = applyConversion(fromVal, conversion, fromUnit, toUnit);
    }

    document.getElementById("toValue").value = result;
    const expression = `${fromVal} ${fromUnit} = ${result} ${toUnit}`;
    document.getElementById("resultText").textContent = expression;

    await saveHistory({ expression: expression, timestamp: Date.now() });
    await loadHistory();

  } catch (error) {
    showError(error.message || "Conversion failed.");
  }
}

// Perform Comparison (Action 2)
async function performComparison() {
  const fromValStr = document.getElementById("fromValue").value;
  const toValStr = document.getElementById("toValue").value; 
  const fromUnit = document.getElementById("fromUnit").value;
  const toUnit = document.getElementById("toUnit").value;

  if (!fromValStr || !toValStr) {
    showError("Enter both values to compare");
    return;
  }

  const v1 = parseFloat(fromValStr);
  const v2 = parseFloat(toValStr);

  try {
    let resultMessage = "";

    if (fromUnit === toUnit) {
      resultMessage = compareValues(v1, fromUnit, v2, toUnit, v1, v2);
    } else {
      // Convert v2 into v1's unit to get a common base
      const conversion = await getConversion(toUnit, fromUnit);
      const base2 = applyConversion(v2, conversion, toUnit, fromUnit);
      const base1 = v1; 
      
      resultMessage = compareValues(v1, fromUnit, v2, toUnit, base1, base2);
    }

    document.getElementById("resultText").textContent = resultMessage;

    await saveHistory({ expression: resultMessage, timestamp: Date.now() });
    await loadHistory();

  } catch (error) {
    showError(error.message || "Comparison failed.");
  }
}

// UI Helpers
function setActiveDefaults() {
  const firstType = document.querySelector(".feature-card");
  if (firstType) firstType.classList.add("active");
}

function showError(message) {
  const errorBanner = document.getElementById("errorBanner");
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.classList.remove("d-none");
}

// UI Helper: Show or hide the operator row
function toggleOperators(show) {
  // Make sure your HTML has an element wrapping the operators with id="operatorRow"
  const operatorRow = document.getElementById("operatorRow");
  if (!operatorRow) return;

  operatorRow.style.display = show ? "block" : "none";
}