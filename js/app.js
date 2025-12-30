document.addEventListener("DOMContentLoaded", () => {
  const algorithmSelect = document.getElementById("algorithmSelect");
  const depthInput = document.getElementById("depthInput");
  const generateBtn = document.getElementById("generateBtn");
  const prevStepBtn = document.getElementById("prevStepBtn");
  const nextStepBtn = document.getElementById("nextStepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const exportPngBtn = document.getElementById("exportPngBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const svgElem = document.getElementById("treeSvg");
  const complexityBox = document.getElementById("complexityBox");

  function updateComplexity() {
    const algo = algorithmSelect.value;
    if (algo === "karatsuba") {
      complexityBox.innerHTML = `
                <h3>Karatsuba Multiplication</h3>
                <p>Recurrence: T(n) = 3T(n/2) + O(n)</p>
                <p>Time Complexity: <strong>O(n<sup>log<sub>2</sub> 3</sup>) ≈ O(n<sup>1.585</sup>)</strong></p>
                <p>Idea: split numbers into halves, do 3 recursive multiplications instead of 4 (classical).</p>
            `;
    } else {
      complexityBox.innerHTML = `
                <h3>Max Subarray (Divide &amp; Conquer)</h3>
                <p>Recurrence: T(n) = 2T(n/2) + O(n)</p>
                <p>Time Complexity: <strong>O(n log n)</strong></p>
                <p>Each step: max(left, right, cross). Cross is computed linearly, not further divided.</p>
            `;
    }
  }

  function generateTree() {
    const depth = Math.max(
      1,
      Math.min(8, parseInt(depthInput.value || "1", 10))
    );
    depthInput.value = depth.toString();

    let tree;
    if (algorithmSelect.value === "karatsuba") {
      tree = buildKaratsubaTreeFromInput(depth);
    } else {
      tree = buildMaxSubarrayTreeFromInput(depth);
    }

    renderTree(tree, svgElem);
  }

  generateBtn.addEventListener("click", generateTree);
  algorithmSelect.addEventListener("change", () => {
    updateComplexity();
    generateTree();
  });

  prevStepBtn.addEventListener("click", () => {
    updateStep(svgElem, currentStepIndex - 1);
  });

  nextStepBtn.addEventListener("click", () => {
    updateStep(svgElem, currentStepIndex + 1);
  });

  resetBtn.addEventListener("click", () => {
    generateTree();
  });

  exportPngBtn.addEventListener("click", exportPng);
  exportPdfBtn.addEventListener("click", exportPdf);

  // initial
  updateComplexity();
  generateTree();

  // Optional: resize handling
  window.addEventListener("resize", () => {
    if (currentTree) renderTree(currentTree, svgElem);
  });
});
