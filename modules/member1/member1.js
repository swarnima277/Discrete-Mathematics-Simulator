/* Member 1 - Modular Arithmetic Calculator & Congruence Solver
   Calculation logic is Member 1's original code, unchanged.
   Integration-only edits: (1) element ids prefixed "m1_" so they don't clash with
   Members 3/4 ids on the shared page, (2) the standalone-page theme toggle and the
   leftover m2/m3/m4 test code were removed (those modules live in their own folders),
   (3) addToHistory()/Clear History added at the bottom - it was called but never defined. */
const copyResultBtn = document.getElementById("m1_copyResultBtn");
const resultBox = document.getElementById("m1_result");

function modularAddition(a, b, n) {
  return ((a % n) + (b % n) + n) % n;
}

function modularSubtraction(a, b, n) {
  return ((a % n) - (b % n) + n) % n;
}

function modularMultiplication(a, b, n) {
  return ((((a % n) * (b % n)) % n) + n) % n;
}

function modularExponentiation(a, b, n) {
  let result = 1 % n;
  let base = ((a % n) + n) % n;
  let exponent = b;

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % n;
    }

    base = (base * base) % n;
    exponent = Math.floor(exponent / 2);
  }

  return result;
}

function getExponentiationSteps(a, b, n) {
  let result = 1 % n;
  let base = ((a % n) + n) % n;
  let exponent = b;
  const steps = [];

  steps.push(
    `Initial values: base = ${base}, exponent = ${exponent}, result = ${result}`,
  );

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      const oldResult = result;
      result = (result * base) % n;

      steps.push(`Result = (${oldResult} × ${base}) mod ${n} = ${result}`);
    }

    exponent = Math.floor(exponent / 2);

    if (exponent > 0) {
      const oldBase = base;
      base = (base * base) % n;

      steps.push(`Base = (${oldBase} × ${oldBase}) mod ${n} = ${base}`);
    }
  }

  steps.push(`Final answer: ${result}`);
  return steps;
}

function showMessage(resultBox, message, type = "error") {
  resultBox.replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.className = type;
  paragraph.textContent = message;

  resultBox.appendChild(paragraph);
}

function getIntegerInputs(ids, resultBox) {
  const values = [];

  for (const id of ids) {
    const input = document.getElementById(id);
    const value = input.value.trim();

    if (value === "") {
      showMessage(resultBox, "Please enter all required values.");
      return null;
    }

    const number = Number(value);

    if (!Number.isSafeInteger(number)) {
      showMessage(resultBox, "Please enter valid safe integers.");
      return null;
    }

    values.push(number);
  }

  return values;
}

function calculate() {
  const resultBox = document.getElementById("m1_result");
  const values = getIntegerInputs(["m1_a", "m1_b", "m1_n"], resultBox);

  if (!values) return;

  const [a, b, n] = values;
  const operation = document.getElementById("m1_operation").value;

  if (n <= 0) {
    showMessage(resultBox, "Modulus n must be greater than zero.");
    return;
  }

  if (operation === "exponentiation" && b < 0) {
    showMessage(resultBox, "Exponent b must be non-negative.");
    return;
  }

  let answer;
  let formula;
  let working;
  let extraSteps = [];

  switch (operation) {
    case "addition":
      answer = modularAddition(a, b, n);
      formula = `(${a} + ${b}) mod ${n}`;
      working = `${a} + ${b} = ${a + b}`;
      break;

    case "subtraction":
      answer = modularSubtraction(a, b, n);
      formula = `(${a} - ${b}) mod ${n}`;
      working = `${a} - ${b} = ${a - b}`;
      break;

    case "multiplication":
      answer = modularMultiplication(a, b, n);
      formula = `(${a} × ${b}) mod ${n}`;
      working = `${a} × ${b} = ${a * b}`;
      break;

    case "exponentiation":
      answer = modularExponentiation(a, b, n);
      formula = `${a}^${b} mod ${n}`;
      working = "Using fast modular exponentiation:";
      extraSteps = getExponentiationSteps(a, b, n);
      break;

    default:
      showMessage(resultBox, "Please select a valid operation.");
      return;
  }

  resultBox.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "Calculation Steps";

  const formulaLine = document.createElement("p");
  formulaLine.textContent = "Step 1: " + formula;

  const workingLine = document.createElement("p");
  workingLine.textContent = "Step 2: " + working;

  resultBox.append(heading, formulaLine, workingLine);

  extraSteps.forEach((step, index) => {
    const line = document.createElement("p");
    line.textContent = `Step ${index + 3}: ${step}`;
    resultBox.appendChild(line);
  });

  const remainderLine = document.createElement("p");
  remainderLine.textContent = `Final remainder after division by ${n} = ${answer}`;

  const answerLine = document.createElement("h3");
  answerLine.className = "success";
  answerLine.textContent = "Final Answer: " + answer;

  resultBox.append(remainderLine, answerLine);

  copyResultBtn.disabled = false;

  addToHistory(operation, a, b, n, answer);
}

document.getElementById("m1_calculateBtn").addEventListener("click", calculate);

// Congruence Checker

function checkCongruence() {
  const resultBox = document.getElementById("m1_congruenceResult");
  const values = getIntegerInputs(["m1_congA", "m1_congB", "m1_congN"], resultBox);

  if (!values) return;

  const [a, b, n] = values;

  if (n <= 0) {
    showMessage(resultBox, "Modulus n must be greater than zero.");
    return;
  }

  const remainderA = ((a % n) + n) % n;
  const remainderB = ((b % n) + n) % n;
  const difference = a - b;
  const differenceRemainder = ((difference % n) + n) % n;

  resultBox.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "Congruence Check";

  const step1 = document.createElement("p");
  step1.textContent = `Step 1: ${a} mod ${n} = ${remainderA}`;

  const step2 = document.createElement("p");
  step2.textContent = `Step 2: ${b} mod ${n} = ${remainderB}`;

  const step3 = document.createElement("p");
  step3.textContent = `Step 3: ${a} - ${b} = ${difference}`;

  const step4 = document.createElement("p");
  step4.textContent = `Step 4: (${a} - ${b}) mod ${n} = ${differenceRemainder}`;

  const answer = document.createElement("h3");

  if (remainderA === remainderB) {
    answer.className = "success";
    answer.textContent = `${a} ≡ ${b} (mod ${n}). The numbers are CONGRUENT.`;
  } else {
    answer.className = "error";
    answer.textContent = `${a} ≢ ${b} (mod ${n}). The numbers are NOT CONGRUENT.`;
  }

  resultBox.append(heading, step1, step2, step3, step4, answer);
}

document
  .getElementById("m1_checkCongruenceBtn")
  .addEventListener("click", checkCongruence);

// Remainder Classes Visualizer

function generateRemainderClasses() {
  const resultBox = document.getElementById("m1_remainderResult");

  const values = getIntegerInputs(
    ["m1_remainderN", "m1_rangeStart", "m1_rangeEnd"],
    resultBox,
  );

  if (!values) return;

  const [n, start, end] = values;

  if (n <= 0) {
    showMessage(resultBox, "Modulus must be greater than zero.");
    return;
  }

  if (n > 500) {
    showMessage(
      resultBox,
      "Please use a modulus of 500 or less for visualization.",
    );
    return;
  }

  if (start > end) {
    showMessage(
      resultBox,
      "Range start must be less than or equal to range end.",
    );
    return;
  }

  if (end - start > 500) {
    showMessage(
      resultBox,
      "Please choose a range containing at most 501 integers.",
    );
    return;
  }

  const classes = Array.from({ length: n }, () => []);

  for (let i = start; i <= end; i++) {
    const remainder = ((i % n) + n) % n;
    classes[remainder].push(i);
  }

  resultBox.replaceChildren();

  const explanation = document.createElement("p");
  explanation.textContent = `Remainder classes modulo ${n}, for integers from ${start} to ${end}:`;

  resultBox.appendChild(explanation);

  classes.forEach((numbers, remainder) => {
    const classBox = document.createElement("div");
    classBox.className = "remainder-class";

    const heading = document.createElement("h3");
    heading.textContent = `[${remainder}] modulo ${n}`;

    const contents = document.createElement("p");
    contents.textContent = numbers.length
      ? numbers.join(", ")
      : "No integers from the selected range belong to this class.";

    classBox.append(heading, contents);
    resultBox.appendChild(classBox);
  });
}

document
  .getElementById("m1_generateClassesBtn")
  .addEventListener("click", generateRemainderClasses);

// Greatest Common Divisor

function calculateGCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

// Linear Congruence Solver

function solveLinearCongruence() {
  const resultBox = document.getElementById("m1_linearResult");

  const values = getIntegerInputs(["m1_linearA", "m1_linearB", "m1_linearN"], resultBox);

  if (!values) return;

  const [a, b, n] = values;

  if (n <= 0) {
    showMessage(resultBox, "Modulus must be greater than zero.");
    return;
  }

  if (n > 10000) {
    showMessage(resultBox, "Please use a modulus of 10000 or less.");
    return;
  }

  resultBox.replaceChildren();

  const gcd = calculateGCD(a, n);

  const heading = document.createElement("h3");
  heading.textContent = `Solving ${a}x ≡ ${b} (mod ${n})`;

  const step1 = document.createElement("p");
  step1.textContent = `Step 1: gcd(${a}, ${n}) = ${gcd}`;

  resultBox.append(heading, step1);

  if (b % gcd !== 0) {
    const answer = document.createElement("h3");
    answer.className = "error";
    answer.textContent = `No solution exists because ${gcd} does not divide ${b}.`;

    resultBox.appendChild(answer);
    return;
  }

  const reducedA = a / gcd;
  const reducedB = b / gcd;
  const reducedN = n / gcd;

  const step2 = document.createElement("p");
  step2.textContent = `Step 2: Since ${gcd} divides ${b}, solutions exist.`;

  const step3 = document.createElement("p");
  step3.textContent = `Step 3: Reduce the equation to ${reducedA}x ≡ ${reducedB} (mod ${reducedN}).`;

  resultBox.append(step2, step3);

  let inverse = 0;

  if (reducedN > 1) {
    let found = false;

    for (let i = 0; i < reducedN; i++) {
      const remainder = (((reducedA * i) % reducedN) + reducedN) % reducedN;

      if (remainder === 1) {
        inverse = i;
        found = true;
        break;
      }
    }

    if (!found) {
      showMessage(
        resultBox,
        "Unable to find the modular inverse for these inputs.",
      );
      return;
    }
  }

  const firstSolution =
    (((inverse * reducedB) % reducedN) + reducedN) % reducedN;

  const solutions = [];

  for (let k = 0; k < gcd; k++) {
    solutions.push(firstSolution + k * reducedN);
  }

  const step4 = document.createElement("p");
  step4.textContent = `Step 4: A modular inverse of ${reducedA} modulo ${reducedN} is ${inverse}.`;

  const answer = document.createElement("h3");
  answer.className = "success";
  answer.textContent = `Solutions modulo ${n}: x = ${solutions.join(", ")}`;

  resultBox.append(step4, answer);
}

document
  .getElementById("m1_solveLinearBtn")
  .addEventListener("click", solveLinearCongruence);

copyResultBtn.disabled = true;

copyResultBtn.addEventListener("click", async function () {
  const resultText = resultBox.innerText.trim();

  if (resultText === "") {
    alert("Please calculate a result first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(resultText);
    copyResultBtn.textContent = "Copied!";

    setTimeout(function () {
      copyResultBtn.textContent = "Copy Result";
    }, 1500);
  } catch (error) {
    alert("Unable to copy. Please copy the result manually.");
  }
});

copyResultBtn.disabled = false;

const clearInputsBtn = document.getElementById("m1_clearInputsBtn");

clearInputsBtn.addEventListener("click", function () {
  document.getElementById("m1_a").value = "";
  document.getElementById("m1_b").value = "";
  document.getElementById("m1_n").value = "";

  document.getElementById("m1_result").replaceChildren();

  copyResultBtn.disabled = true;
  copyResultBtn.textContent = "Copy Result";
});

const exampleBtn = document.getElementById("m1_exampleBtn");

exampleBtn.addEventListener("click", function () {
    document.getElementById("m1_operation").value = "exponentiation";
    document.getElementById("m1_a").value = 2;
    document.getElementById("m1_b").value = 10;
    document.getElementById("m1_n").value = 7;

    calculate();
});




/* ---- Integration: calculation history (addToHistory was called above but never defined) ---- */
const historyList = document.getElementById("m1_historyList");
const OPERATION_SYMBOLS = { addition: "+", subtraction: "-", multiplication: "×", exponentiation: "^" };

function addToHistory(operation, a, b, n, answer) {
  const item = document.createElement("li");
  const symbol = OPERATION_SYMBOLS[operation] || operation;
  item.textContent = `${a} ${symbol} ${b} (mod ${n}) = ${answer}`;
  historyList.prepend(item);
}

document.getElementById("m1_clearHistoryBtn").addEventListener("click", function () {
  historyList.replaceChildren();
});
