document.addEventListener("DOMContentLoaded", () => {
  const algorithmPicker = document.getElementById("algorithmPicker");
  const inputBox = document.getElementById("inputBox");
  const generateBtn = document.getElementById("generateBtn");
  const prevBtn = document.getElementById("prevStepBtn");
  const nextBtn = document.getElementById("nextStepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const treeSvg = document.getElementById("treeSvg");
  const complexityBox = document.getElementById("complexityBox");
  const stepInfoBox = document.getElementById("stepInfoBox");
  const codeBtn = document.getElementById("codeBtn");
  const codeModal = document.getElementById("codeModal");
  const closeModal = document.getElementById("closeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  let resizeTimer = null;

  // ── Algorithm picker ───────────────────────────────────────

  function getAlgo() {
    return (
      algorithmPicker.querySelector(".algo-card.selected")?.dataset.value ||
      "karatsuba"
    );
  }

  function resetVisuals() {
    complexityBox.innerHTML = "";
    treeSvg.innerHTML = "";
    treeSvg.removeAttribute("viewBox");
    treeSvg.removeAttribute("width");
    treeSvg.removeAttribute("height");
    const counter = document.getElementById("stepCounter");
    if (counter) counter.textContent = "";
    clearStepInfo();
  }

  algorithmPicker.addEventListener("click", (e) => {
    const card = e.target.closest(".algo-card");
    if (!card) return;
    algorithmPicker
      .querySelectorAll(".algo-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    renderInput();
    resetVisuals();
  });

  // ── Modal content ──────────────────────────────────────────

  const MODAL_CONTENT = {
    karatsuba: {
      title: "Karatsuba Multiplication",
      pseudo: `<ol>
  <li><span class="kw">function</span> karatsuba(x, y):</li>
  <li>&nbsp;&nbsp;<span class="kw">if</span> x &lt; 10 <span class="kw">or</span> y &lt; 10: <span class="cm">// base case</span></li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">return</span> x × y</li>
  <li>&nbsp;&nbsp;n ← max(digits(x), digits(y))</li>
  <li>&nbsp;&nbsp;m ← ⌈n / 2⌉</li>
  <li>&nbsp;&nbsp;a ← ⌊x / 10^m⌋,&nbsp; b ← x mod 10^m</li>
  <li>&nbsp;&nbsp;c ← ⌊y / 10^m⌋,&nbsp; d ← y mod 10^m</li>
  <li>&nbsp;&nbsp;z0 ← karatsuba(b, d) <span class="cm">// low × low</span></li>
  <li>&nbsp;&nbsp;z1 ← karatsuba(a+b, c+d) <span class="cm">// (low+high) × (low+high)</span></li>
  <li>&nbsp;&nbsp;z2 ← karatsuba(a, c) <span class="cm">// high × high</span></li>
  <li>&nbsp;&nbsp;<span class="kw">return</span> z2·10^(2m) + (z1 − z2 − z0)·10^m + z0</li>
</ol>`,
      java: `public class Karatsuba {

    public static long karatsuba(long x, long y) {
        // Base case: single digit multiplication
        if (x < 10 || y < 10) return x * y;

        int n = Math.max(
            Long.toString(x).length(),
            Long.toString(y).length()
        );
        int m = (n + 1) / 2;              // ceil(n / 2)
        long base = (long) Math.pow(10, m);

        long a = x / base;  // high half of x
        long b = x % base;  // low  half of x
        long c = y / base;  // high half of y
        long d = y % base;  // low  half of y

        long z0 = karatsuba(b, d);         // low  × low
        long z1 = karatsuba(a + b, c + d); // (high+low) × (high+low)
        long z2 = karatsuba(a, c);         // high × high

        // Combine: only 3 recursive calls instead of 4
        return z2 * (long) Math.pow(10, 2 * m)
             + (z1 - z2 - z0) * base
             + z0;
    }

    public static void main(String[] args) {
        long x = 1234, y = 5678;
        System.out.println(x + " x " + y
            + " = " + karatsuba(x, y));
    }
}`,
      cpp: `#include <iostream>
#include <cmath>
#include <string>
#include <algorithm>
using namespace std;

long long karatsuba(long long x, long long y) {
    // Base case: single digit multiplication
    if (x < 10 || y < 10) return x * y;

    int n = max(to_string(x).length(),
                to_string(y).length());
    int m = (n + 1) / 2;                // ceil(n / 2)
    long long base = pow(10, m);

    long long a = x / base;  // high half of x
    long long b = x % base;  // low  half of x
    long long c = y / base;  // high half of y
    long long d = y % base;  // low  half of y

    long long z0 = karatsuba(b, d);         // low  × low
    long long z1 = karatsuba(a + b, c + d); // (high+low) × (high+low)
    long long z2 = karatsuba(a, c);         // high × high

    // Combine: only 3 recursive calls instead of 4
    return z2 * (long long)pow(10, 2 * m)
         + (z1 - z2 - z0) * base
         + z0;
}

int main() {
    long long x = 1234, y = 5678;
    cout << x << " x " << y
         << " = " << karatsuba(x, y) << endl;
    return 0;
}`,
    },

    maxSubarray: {
      title: "Maximum Subarray",
      pseudo: `<ol>
  <li><span class="kw">function</span> maxSubarray(arr, l, r):</li>
  <li>&nbsp;&nbsp;<span class="kw">if</span> l == r: <span class="cm">// base case</span></li>
  <li>&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">return</span> {sum: arr[l], l, r}</li>
  <li>&nbsp;&nbsp;mid ← ⌊(l + r) / 2⌋</li>
  <li>&nbsp;&nbsp;left  ← maxSubarray(arr, l, mid)</li>
  <li>&nbsp;&nbsp;right ← maxSubarray(arr, mid+1, r)</li>
  <li>&nbsp;&nbsp;<span class="cm">// best crossing subarray</span></li>
  <li>&nbsp;&nbsp;leftMax  ← max suffix sum ending at mid</li>
  <li>&nbsp;&nbsp;rightMax ← max prefix sum starting at mid+1</li>
  <li>&nbsp;&nbsp;cross ← {sum: leftMax + rightMax, l: bestL, r: bestR}</li>
  <li>&nbsp;&nbsp;<span class="kw">return</span> max(left, right, cross) <span class="cm">// by .sum</span></li>
</ol>`,
      java: `public class MaxSubarray {

    static int[] result = new int[3]; // {sum, l, r}

    public static int[] maxSubarray(int[] arr, int l, int r) {
        // Base case: single element
        if (l == r) return new int[]{arr[l], l, r};

        int mid = (l + r) / 2;
        int[] left  = maxSubarray(arr, l, mid);
        int[] right = maxSubarray(arr, mid + 1, r);

        // Best suffix ending at mid (left side of cross)
        int sum = 0, leftMax = Integer.MIN_VALUE, bestL = mid;
        for (int i = mid; i >= l; i--) {
            sum += arr[i];
            if (sum > leftMax) { leftMax = sum; bestL = i; }
        }

        // Best prefix starting at mid+1 (right side of cross)
        sum = 0;
        int rightMax = Integer.MIN_VALUE, bestR = mid + 1;
        for (int i = mid + 1; i <= r; i++) {
            sum += arr[i];
            if (sum > rightMax) { rightMax = sum; bestR = i; }
        }

        int[] cross = {leftMax + rightMax, bestL, bestR};

        // Return whichever of the three is largest
        if (left[0] >= right[0] && left[0] >= cross[0]) return left;
        if (right[0] >= left[0] && right[0] >= cross[0]) return right;
        return cross;
    }

    public static void main(String[] args) {
        int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        int[] res = maxSubarray(arr, 0, arr.length - 1);
        System.out.println("Max sum: " + res[0]
            + "  from index " + res[1]
            + " to " + res[2]);
    }
}`,
      cpp: `#include <iostream>
#include <climits>
#include <vector>
using namespace std;

struct Result {
    int sum, l, r;
};

Result maxSubarray(vector<int>& arr, int l, int r) {
    // Base case: single element
    if (l == r) return {arr[l], l, r};

    int mid = (l + r) / 2;
    Result left  = maxSubarray(arr, l, mid);
    Result right = maxSubarray(arr, mid + 1, r);

    // Best suffix ending at mid (left side of cross)
    int sum = 0, leftMax = INT_MIN, bestL = mid;
    for (int i = mid; i >= l; i--) {
        sum += arr[i];
        if (sum > leftMax) { leftMax = sum; bestL = i; }
    }

    // Best prefix starting at mid+1 (right side of cross)
    sum = 0;
    int rightMax = INT_MIN, bestR = mid + 1;
    for (int i = mid + 1; i <= r; i++) {
        sum += arr[i];
        if (sum > rightMax) { rightMax = sum; bestR = i; }
    }

    Result cross = {leftMax + rightMax, bestL, bestR};

    // Return whichever of the three is largest
    if (left.sum >= right.sum && left.sum >= cross.sum) return left;
    if (right.sum >= left.sum && right.sum >= cross.sum) return right;
    return cross;
}

int main() {
    vector<int> arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    Result res = maxSubarray(arr, 0, arr.size() - 1);
    cout << "Max sum: " << res.sum
         << "  from index " << res.l
         << " to " << res.r << endl;
    return 0;
}`,
    },
  };

  // ── Input rendering ────────────────────────────────────────

  function renderInput() {
    if (getAlgo() === "karatsuba") {
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

  renderInput();

  // ── Generate ───────────────────────────────────────────────

  generateBtn.addEventListener("click", () => {
    if (getAlgo() === "karatsuba") {
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

  // ── Step navigation ────────────────────────────────────────

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

  // ── Step Info Box ──────────────────────────────────────────

  function clearStepInfo() {
    stepInfoBox.classList.add("empty");
    stepInfoBox.innerHTML = "<span>Generate a tree to see step details</span>";
  }

  window.onStepChanged = function (node) {
    if (!node) {
      clearStepInfo();
      return;
    }

    stepInfoBox.classList.remove("empty");
    const lines = [];

    if (node.steps) {
      if (node.steps.type === "base") {
        lines.push(
          `<div class="sib-line"><strong>Node:</strong> ${node.label}</div>`,
        );
        lines.push(
          `<div class="sib-line"><strong>Base case:</strong> ${node.steps.calculation} = ${node.steps.value}</div>`,
        );
      } else if (node.steps.split) {
        const { a, b, c, d, m } = node.steps.split;
        const { z0, z1, z2 } = node.steps.zValues;
        lines.push(
          `<div class="sib-line"><strong>Node:</strong> ${node.label}</div>`,
        );
        lines.push(
          `<div class="sib-line"><strong>Split:</strong> m=${m}  a=${a}  b=${b}  c=${c}  d=${d}</div>`,
        );
        lines.push(
          `<div class="sib-line"><strong>z0</strong>=${z0} &nbsp;<strong>z1</strong>=${z1} &nbsp;<strong>z2</strong>=${z2}</div>`,
        );
        lines.push(
          `<div class="sib-line"><strong>Result:</strong> ${node.steps.value}</div>`,
        );
      }
    } else if (node.result !== null && node.result !== undefined) {
      lines.push(
        `<div class="sib-line"><strong>Node:</strong> ${node.label}</div>`,
      );
      if (typeof node.result === "object") {
        lines.push(
          `<div class="sib-line"><strong>Sum:</strong> ${node.result.sum}</div>`,
        );
        lines.push(
          `<div class="sib-line"><strong>Indices:</strong> [${node.result.l}, ${node.result.r}]</div>`,
        );
      } else {
        lines.push(
          `<div class="sib-line"><strong>Value:</strong> ${node.result}</div>`,
        );
      }
    } else {
      lines.push(
        `<div class="sib-line"><strong>Node:</strong> ${node.label}</div>`,
      );
    }

    stepInfoBox.innerHTML = `<h4>Current Step</h4>` + lines.join("");
  };

  // ── Modal ──────────────────────────────────────────────────

  let activeTab = "pseudo";

  function renderModal() {
    const content = MODAL_CONTENT[getAlgo()];
    modalTitle.textContent = content.title;

    modalBody.innerHTML = `
      <div class="pseudo-panel ${activeTab === "pseudo" ? "active" : ""}">
        <ol class="pseudo-list">${content.pseudo}</ol>
      </div>
      <div class="code-panel ${activeTab === "java" ? "active" : ""}">
        <pre>${escapeHtml(content.java)}</pre>
      </div>
      <div class="code-panel ${activeTab === "cpp" ? "active" : ""}">
        <pre>${escapeHtml(content.cpp)}</pre>
      </div>
    `;

    document.querySelectorAll(".modal-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === activeTab);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  codeBtn.addEventListener("click", () => {
    renderModal();
    codeModal.classList.add("open");
  });

  closeModal.addEventListener("click", () => {
    codeModal.classList.remove("open");
  });

  codeModal.addEventListener("click", (e) => {
    if (e.target === codeModal) codeModal.classList.remove("open");
  });

  codeModal.addEventListener("click", (e) => {
    const tab = e.target.closest(".modal-tab");
    if (tab && tab.dataset.tab) {
      activeTab = tab.dataset.tab;
      renderModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") codeModal.classList.remove("open");
  });
});
