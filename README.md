Use Case ID : UC-JS-16

Name : Handle Action Tab Click

Actor : End User

Trigger : User clicks an action tab

Preconditions : Event listeners attached.

Postconditions : state.action updated. Operator row shown/hidden. Result cleared.

Main Flow

1. querySelectorAll(".action-btn").forEach(btn => btn.addEventListener("click", () => {

2.   state.action = btn.dataset.action

3.   setActive(actionSelector, btn, ".action-btn")

4.   toggleOperators(state.action === "Arithmetic")

5.   showResult(0, "") }))
