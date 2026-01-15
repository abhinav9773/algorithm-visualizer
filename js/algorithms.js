// js/algorithms.js

/* ================= KARATSUBA (unchanged) ================= */

function buildKaratsubaTreeFromInput(x0, y0) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function karatsuba(x, y, parentId = null) {
    const nodeId = id++;

    const node = {
      id: nodeId,
      label: `K(${x}, ${y})`,
      depth: parentId === null ? 0 : nodes[parentId].depth + 1,
      result: null,
    };
    nodes.push(node);

    if (parentId !== null) edges.push({ from: parentId, to: nodeId });

    if (x < 10 || y < 10) {
      node.result = x * y;
      return node.result;
    }

    const n = Math.max(x.toString().length, y.toString().length);
    const m = Math.floor(n / 2);
    const base = 10 ** m;

    const a = Math.floor(x / base);
    const b = x % base;
    const c = Math.floor(y / base);
    const d = y % base;

    const z0 = karatsuba(b, d, nodeId);
    const z1 = karatsuba(a + b, c + d, nodeId);
    const z2 = karatsuba(a, c, nodeId);

    node.result = z2 * 10 ** (2 * m) + (z1 - z2 - z0) * 10 ** m + z0;

    return node.result;
  }

  const finalResult = karatsuba(x0, y0, null);
  return { nodes, edges, finalResult };
}

/* ================= MAX SUBARRAY (SUM + SUBARRAY) ================= */

function buildMaxSubarrayTreeFromInput(arr) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function solve(l, r, parentId = null) {
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      label: `MS(${l},${r})`,
      depth: parentId === null ? 0 : nodes[parentId].depth + 1,
    });

    if (parentId !== null) edges.push({ from: parentId, to: nodeId });

    // Base case
    if (l === r) {
      return { sum: arr[l], l, r };
    }

    const mid = Math.floor((l + r) / 2);

    const left = solve(l, mid, nodeId);
    const right = solve(mid + 1, r, nodeId);

    // Best suffix on left
    let sum = 0,
      leftMax = -Infinity,
      bestL = mid;
    for (let i = mid; i >= l; i--) {
      sum += arr[i];
      if (sum > leftMax) {
        leftMax = sum;
        bestL = i;
      }
    }

    // Best prefix on right
    sum = 0;
    let rightMax = -Infinity,
      bestR = mid + 1;
    for (let i = mid + 1; i <= r; i++) {
      sum += arr[i];
      if (sum > rightMax) {
        rightMax = sum;
        bestR = i;
      }
    }

    const cross = {
      sum: leftMax + rightMax,
      l: bestL,
      r: bestR,
    };

    const crossId = id++;
    nodes.push({
      id: crossId,
      label: `Cross(${l}-${r})`,
      depth: nodes[nodeId].depth + 1,
    });
    edges.push({ from: nodeId, to: crossId });

    // Return the best of three
    if (left.sum >= right.sum && left.sum >= cross.sum) return left;
    if (right.sum >= left.sum && right.sum >= cross.sum) return right;
    return cross;
  }

  const result = solve(0, arr.length - 1, null);
  return { nodes, edges, finalResult: result };
}
