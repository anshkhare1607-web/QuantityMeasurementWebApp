UC-JS-02  Initialise App on Page Load

Wire up event listeners and load default data


Use Case ID

UC-JS-02

Name

App Initialisation

Actor

End User

Trigger

DOMContentLoaded event fires

Preconditions

json-server is running. All JS files are loaded.

Postconditions

Unit dropdowns are populated. History is rendered. All event listeners are attached.

Main Flow

1. Wrap all code in: document.addEventListener("DOMContentLoaded", async () => { ... })

2. Declare state = { type:"Length", action:"Conversion", fromVal:null, fromUnit:"", toVal:null, toUnit:"", operator:"+" }

3. Call attachEventListeners().

4. Call loadUnits("Length") to populate FROM and TO dropdowns.

5. Set first type-card and first action-button as active.

6. Hide operator row: toggleOperators(false).

7. Call loadHistory().
