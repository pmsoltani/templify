import { useReducer } from "react";

/**
 * A generic reducer for handling state updates for form fields.
 * @param {object} state - The current state object.
 * @param {object} action - The action to perform, e.g., { type: 'SET_FIELD', field: 'email', payload: '...' }.
 * @returns The new state object.
 */
function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.payload };
    case "RESET_FORM":
      return action.payload;
    default:
      return state;
  }
}

/**
 * A custom hook to manage complex form state.
 * @param {object} initialState The initial state for the form.
 * @returns {[object, Function, Function]} A tuple containing the state, a setField
 * updater, and a resetForm function.
 */
export default function useFormReducer(initialState) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = (e) => {
    const payload = e.target.type === "file" ? e.target.files[0] : e.target.value;
    dispatch({ type: "SET_FIELD", field: e.target.name, payload: payload });
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM", payload: initialState });
  };

  return [state, setField, resetForm];
}
