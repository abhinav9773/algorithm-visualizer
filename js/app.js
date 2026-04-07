document.addEventListener("DOMContentLoaded", () => {
  const algorithmSelect = document.getElementById("algorithmSelect");
  const inputBox = document.getElementById("inputBox");
  const generateBtn = document.getElementById("generateBtn");
  const prevBtn = document.getElementById("prevStepBtn");
  const nextBtn = document.getElementById("nextStepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const treeSvg = document.getElementById("treeSvg");
  const complexityBox = document.getElementById("complexityBox");
  let resizeTimer = null;

  function renderInput() {
    if (algorithmSelect.value === "karatsuba") {
      inputBox.innerHTML = `
        <label>Numbers</label>
        <input id="xInput" type="number" placeholder="First number, e.g. 1234" />
        <input id="yInput" type="number" placeholder="Second number, e.g. 5678" />
      `;
    } else {
      inputBox.innerHTML = `
        <label>Array (comma-separated)</label>
        <input id="arrayInput" type="text" placeholder="-2,1,-3,4,-1,2,1,-5,4" />
      `;
    }
  }

  algorithmSelect.addEventListener("change", () => {
    renderInput();
    complexityBox.innerHTML = "";
    treeSvg.innerHTML = "";
    treeSvg.removeAttribute("viewBox");
    treeSvg.removeAttribute("width");
    treeSvg.removeAttribute("height");
    const counter = document.getElementById("stepCounter");
    if (counter) counter.textContent = "";
  });

  renderInput();

  generateBtn.addEventListener("click", () => {
    if (algorithmSelect.value === "karatsuba") {
      const x = parseInt(document.getElementById("xInput").value, 10);
      const y = parseInt(document.getElementById("yInput").value, 10);

      if (isNaN(x) || isNaN(y)) {
        alert("Please enter valid numbers.");
        return;
      }

      const tree = buildKaratsubaTreeFromInput(x, y);
      renderTree(tree, treeSvg);

      complexityBox.innerHTML = `
        <h3>Karatsuba Multiplication</h3>
        <p><strong>Input:</strong> ${x} x ${y}</p>
        <p><strong>Result:</strong> ${tree.finalResult}</p>
        <p>Time: O(n<sup>log2 3</sup>) ~ O(n<sup>1.585</sup>)</p>
      `;
    } else {
      const raw = document.getElementById("arrayInput").value;
      const arr = raw.split(",").map(Number);

      if (arr.some(isNaN)) {
        alert("Invalid array. Use comma-separated numbers.");
        return;
      }

      const tree = buildMaxSubarrayTreeFromInput(arr);
      renderTree(tree, treeSvg);

      const { sum, l, r } = tree.finalResult;
      const subarray = arr.slice(l, r + 1);

      complexityBox.innerHTML = `
        <h3>Max Subarray (D&C)</h3>
        <p><strong>Array:</strong> [${arr.join(", ")}]</p>
        <p><strong>Max Sum:</strong> ${sum}</p>
        <p><strong>Subarray:</strong> [${subarray.join(", ")}]</p>
        <p><strong>Indices:</strong> ${l} to ${r}</p>
        <p>Time: O(n log n)</p>
      `;
    }
  });

  prevBtn.onclick = () => updateStep(treeSvg, currentStepIndex - 1);
  nextBtn.onclick = () => updateStep(treeSvg, currentStepIndex + 1);
  resetBtn.onclick = () => updateStep(treeSvg, 0);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      updateStep(treeSvg, currentStepIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      updateStep(treeSvg, currentStepIndex - 1);
    }
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => rerenderCurrentTree(treeSvg), 120);
  });
});
