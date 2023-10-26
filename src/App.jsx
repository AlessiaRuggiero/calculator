import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperatorButton from "./OperatorButton";
import "./styles.css";

export const ACTIONS = {
    ADD_DIGIT: "add-digit",
    CHOOSE_OPERATION: "choose-operation",
    EVALUATE: "evaluate",
    CLEAR: "clear",
    DELETE_DIGIT: "delete-digit",
};

function reducer(state, { type, payload }) {
    switch (type) {
        // ------------------------------------------------------------------------------------------
        case ACTIONS.ADD_DIGIT:
            if (state.overwrite) {
                // By default, state.overwrite is set to false. If current entry is following an evaluation, overwrite
                // will have been set to true. Overwrite evaluation with a new expression and reset
                // overwrite to false for further digit appendages.
                return {
                    ...state,
                    currentOperand: payload.digit,
                    overwrite: false,
                };
            }
            if (payload.digit === "0" && state.currentOperand === "0") {
                // Sequence of only 0s not allowed --> perform no action
                return state;
            }
            if (payload.digit === "." && state.currentOperand.includes(".")) {
                // Multiple decimals not allowed --> perform no action
                return state;
            }
            // Default action --> (overwrite: false) Append digit
            return {
                ...state,
                currentOperand: `${state.currentOperand || ""}${payload.digit}`,
            };
        // ------------------------------------------------------------------------------------------
        case ACTIONS.CHOOSE_OPERATION:
            if (state.previousOperand == null && state.currentOperand == null) {
                // No operand to append to --> perform no action
                return state;
            }
            if (state.previousOperand == null && state.currentOperand) {
                // Push currentOperand to previousOperand and set operator
                return {
                    ...state,
                    previousOperand: state.currentOperand,
                    operator: payload.operator,
                    currentOperand: null,
                };
            }
            if (state.previousOperand && state.currentOperand == null) {
                // Set operator
                return {
                    ...state,
                    operator: payload.operator,
                };
            }
            // Default action --> Perform 2-operand operation, replace previousOperand with evaluation
            // and set operator
            return {
                ...state,
                previousOperand: evaluate(state),
                operator: payload.operator,
                currentOperand: null,
            };
        // ------------------------------------------------------------------------------------------
        case ACTIONS.EVALUATE:
            if (
                state.previousOperand == null ||
                state.currentOperand == null ||
                state.operator == null
            )
                // Incomplete expression --> perform no action
                return state;
            // Default action --> Evaluate solution and replace expression with evaluation
            return {
                ...state,
                overwrite: true,
                previousOperand: null,
                operator: null,
                currentOperand: evaluate(state),
            };
        // ------------------------------------------------------------------------------------------
        case ACTIONS.CLEAR:
            return {};
        // ------------------------------------------------------------------------------------------
        case ACTIONS.DELETE_DIGIT:
            if (state.overwrite) {
                // By default, state.overwrite is set to false. If delete operation is following an evaluation, overwrite
                // will have been set to true. Perform like clear.
                return {};
            }
            if (state.currentOperand == null)
                // Nothing to delete --> perform no action
                return state;
            // Default action --> Remove last digit in currentOperand
            return {
                ...state,
                currentOperand: state.currentOperand.slice(0, -1),
            };
    }
}

function evaluate({ currentOperand, previousOperand, operator }) {
    // Ensure operands are of number-type for operation
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return "";

    let computation = "";
    switch (operator) {
        case "+":
            computation = prev + current;
            break;
        case "-":
            computation = prev - current;
            break;
        case "*":
            computation = prev * current;
            break;
        case "÷":
            computation = prev / current;
            break;
    }
    return computation.toString();
}

function App() {
    const [{ currentOperand, previousOperand, operator }, dispatch] =
        useReducer(reducer, {});

    return (
        <div className="calculator-grid">
            <div className="output-screen">
                <div className="previous-operand">
                    {previousOperand} {operator}
                </div>
                <div className="current-operand">{currentOperand}</div>
            </div>
            <button
                className="span-button"
                onClick={() => dispatch({ type: ACTIONS.CLEAR })}
            >
                AC
            </button>
            <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
                DEL
            </button>
            <OperatorButton operator="÷" dispatch={dispatch} />
            <DigitButton dispatch={dispatch} digit="1" />
            <DigitButton dispatch={dispatch} digit="2" />
            <DigitButton dispatch={dispatch} digit="3" />
            <OperatorButton dispatch={dispatch} operator="*" />
            <DigitButton dispatch={dispatch} digit="4" />
            <DigitButton dispatch={dispatch} digit="5" />
            <DigitButton dispatch={dispatch} digit="6" />
            <OperatorButton dispatch={dispatch} operator="+" />
            <DigitButton dispatch={dispatch} digit="7" />
            <DigitButton dispatch={dispatch} digit="8" />
            <DigitButton dispatch={dispatch} digit="9" />
            <OperatorButton dispatch={dispatch} operator="-" />
            <DigitButton dispatch={dispatch} digit="." />
            <DigitButton dispatch={dispatch} digit="0" />
            <button
                className="span-button"
                onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
            >
                =
            </button>
        </div>
    );
}

export default App;
