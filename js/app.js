// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const algorithmSelect = document.getElementById("algorithmSelect");
  const inputBox = document.getElementById("inputBox");
  const generateBtn = document.getElementById("generateBtn");
  const prevBtn = document.getElementById("prevStepBtn");
  const nextBtn = document.getElementById("nextStepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const treeSvg = document.getElementById("treeSvg");
  const complexityBox = document.getElementById("complexityBox");

  function renderInput() {
    if (algorithmSelect.value === "karatsuba") {
      inputBox.innerHTML = `
        <label>Enter numbers:</label>
        <input id="xInput" type="number" placeholder="X" />
        <input id="yInput" type="number" placeholder="Y" />
      `;
    } else {
      inputBox.innerHTML = `
        <label>Enter array:</label>
        <input id="arrayInput" type="text"
          placeholder="-2,1,-3,4,-1,2,1,-5,4" />
      `;
    }
  }

  algorithmSelect.addEventListener("change", renderInput);
  renderInput();

  generateBtn.addEventListener("click", () => {
    if (algorithmSelect.value === "karatsuba") {
      const x = parseInt(document.getElementById("xInput").value);
      const y = parseInt(document.getElementById("yInput").value);

      if (isNaN(x) || isNaN(y)) {
        alert("Please enter valid numbers");
        return;
      }

      const tree = buildKaratsubaTreeFromInput(x, y);
      renderTree(tree, treeSvg);

      complexityBox.innerHTML = `
        <h3>Karatsuba Multiplication</h3>
        <p><strong>Input:</strong> ${x} × ${y}</p>
        <p><strong>Final Answer:</strong> ${tree.finalResult}</p>
        <p>Time: O(n<sup>log₂3</sup>)</p>
      `;
    } else {
      const arr = document
        .getElementById("arrayInput")
        .value.split(",")
        .map(Number);

      if (arr.some(isNaN)) {
        alert("Invalid array input");
        return;
      }

      const tree = buildMaxSubarrayTreeFromInput(arr);
      renderTree(tree, treeSvg);

      const { sum, l, r } = tree.finalResult;
      const subarray = arr.slice(l, r + 1);

      complexityBox.innerHTML = `
        <h3>Max Subarray (Divide & Conquer)</h3>
        <p><strong>Array:</strong> [${arr.join(", ")}]</p>
        <p><strong>Maximum Sum:</strong> ${sum}</p>
        <p><strong>Subarray:</strong> [${subarray.join(", ")}]</p>
        <p><strong>Indices:</strong> ${l} to ${r}</p>
        <p>Time: O(n log n)</p>
      `;
    }
  });

  prevBtn.onclick = () => updateStep(treeSvg, currentStepIndex - 1);
  nextBtn.onclick = () => updateStep(treeSvg, currentStepIndex + 1);
  resetBtn.onclick = () => updateStep(treeSvg, 0);
});
