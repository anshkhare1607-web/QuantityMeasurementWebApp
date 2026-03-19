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
  const featureCards = document.querySelectorAll(".feature-card");
  
  featureCards.forEach(card => {
    card.addEventListener("click", async () => {
      setActive(document, card, ".feature-card");
      
      const typeText = card.querySelector("h5").textContent.trim().toLowerCase();
      state.type = typeText;
      
      await loadUnits(state.type);
    });
  });

  document.getElementById("tab-conversion").addEventListener("click", () => switchAction("conversion"));
  document.getElementById("tab-comparison").addEventListener("click", () => switchAction("comparison"));
  document.getElementById("tab-arithmetic").addEventListener("click", () => switchAction("arithmetic"));

  document.getElementById("submitBtn").addEventListener("click", handleAction);
}


// Action Tab Switcher
function switchAction(newAction) {
  state.action = newAction;

  const clickedTab = document.getElementById(`tab-${newAction}`);
  setActive(document, clickedTab, ".action-btn");

  toggleOperators(newAction === "arithmetic");

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

  document.getElementById("resultText").textContent = "Result will appear here";
  document.getElementById("errorBanner").classList.add("d-none");
}



// Main Router (Routes Submit button to the right function)
async function handleAction() {
  document.getElementById("errorBanner").classList.add("d-none"); // Clear old errors

  if (state.action === "conversion") {
    await performConversion(); // conversion
  } else if (state.action === "comparison") {
    await performComparison(); // comparison
  } else if (state.action === "arithmetic") {
    await performArithmeticAction(); // arithmetic
  }
}

// asking user ot select a unit
function populateDropdown(selectEl, units) {
  if (!selectEl) {
    console.warn("Dropdown element not found.");
    return;
  }

  selectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "-- Select Unit --";
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectEl.appendChild(defaultOption);

  if (!units || units.length === 0) {
    return;
  }

  units.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.symbol;
    opt.textContent = `${u.label} (${u.symbol})`;
    selectEl.appendChild(opt);
  });
}

async function loadUnits(type) {
  try {
    const units = await getUnits(type);

    const fromDropdown = document.getElementById("fromUnit");
    const toDropdown = document.getElementById("toUnit");

    populateDropdown(fromDropdown, units);
    populateDropdown(toDropdown, units);

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

// Arithmetic Logic
function performArithmetic(v1, v2normalised, op) {
  if (isNaN(v1) || isNaN(v2normalised)) throw new Error("Invalid values");

  switch (op) {
    case "+":
      return parseFloat((v1 + v2normalised).toFixed(6));
    case "-":
      return parseFloat((v1 - v2normalised).toFixed(6));
    case "*":
      return parseFloat((v1 * v2normalised).toFixed(6));
    case "/":
      if (v2normalised === 0) throw new Error("Cannot divide by zero");
      return parseFloat((v1 / v2normalised).toFixed(6));
    default:
      throw new Error("Unknown operator");
  }
}
// Perform Conversion (Action 1)
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
    showResult(result, toUnit); 

    const expression = `${fromVal} ${fromUnit} = ${result} ${toUnit}`;
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
      const conversion = await getConversion(toUnit, fromUnit);
      const base2 = applyConversion(v2, conversion, toUnit, fromUnit);
      const base1 = v1; 
      
      resultMessage = compareValues(v1, fromUnit, v2, toUnit, base1, base2);
    }
    showResult(resultMessage, "");

    await saveHistory({ expression: resultMessage, timestamp: Date.now() });
    await loadHistory();

  } catch (error) {
    showError(error.message || "Comparison failed.");
  }
}

// Perform Arithmetic (Action 3)
async function performArithmeticAction() {
  const fromValStr = document.getElementById("fromValue").value;
  const toValStr = document.getElementById("toValue").value; 
  const fromUnit = document.getElementById("fromUnit").value;
  const toUnit = document.getElementById("toUnit").value;
  
  const operatorElement = document.getElementById("operatorSelect");
  const operator = operatorElement ? operatorElement.value : state.operator;

  if (!fromValStr || !toValStr) {
    showError("Enter both values for arithmetic");
    return;
  }

  const v1 = parseFloat(fromValStr);
  const v2 = parseFloat(toValStr);

  try {
    let v2normalised = v2;

    if (fromUnit !== toUnit) {
      const conversion = await getConversion(toUnit, fromUnit);
      v2normalised = applyConversion(v2, conversion, toUnit, fromUnit);
    }

    const result = performArithmetic(v1, v2normalised, operator);
    showResult(result, fromUnit);

    const expression = `${v1} ${fromUnit} ${operator} ${v2} ${toUnit} = ${result} ${fromUnit}`;
    await saveHistory({ expression: expression, timestamp: Date.now() });
    await loadHistory();

  } catch (error) {
    showError(error.message || "Arithmetic failed.");
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

//Set Active Button
function setActive(parentEl, clickedEl, childSelector) {
  if (!parentEl || !clickedEl) return;
  
  const elements = parentEl.querySelectorAll(childSelector);
  elements.forEach(el => el.classList.remove("active"));
  
  clickedEl.classList.add("active");
}

// Show Result
function showResult(value, unitSymbol) {
  const valueEl = document.querySelector("#result-value");
  const unitEl = document.querySelector("#result-unit");

  // Exception Flow
  if (value === null || value === undefined) {
    if (valueEl) valueEl.textContent = "—";
    if (unitEl) unitEl.textContent = "";
    return;
  }

  // Main & Alternate Flow
  if (valueEl) valueEl.textContent = value;
  if (unitEl) unitEl.textContent = unitSymbol || "";

  // Highlight Animation
  const resultPanel = valueEl.parentElement;
  if (resultPanel) {
    resultPanel.classList.add("highlight");
    setTimeout(() => {
      resultPanel.classList.remove("highlight");
    }, 1500);
  }
}