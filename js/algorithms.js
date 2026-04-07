// ================= KARATSUBA MULTIPLICATION =================

function buildKaratsubaTreeFromInput(x0, y0) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function karatsuba(x, y, parentId = null) {
    const nodeId = id++;

    const node = {
      id: nodeId,
      label: `K(${x},${y})`,
      depth: parentId === null ? 0 : nodes[parentId].depth + 1,
      result: null,
      steps: null,
    };
    nodes.push(node);

    if (parentId !== null) edges.push({ from: parentId, to: nodeId });

    // Base case
    if (x < 10 || y < 10) {
      node.result = x * y;
      node.steps = {
        type: "base",
        calculation: `${x} × ${y}`,
        value: node.result,
      };
      return node.result;
    }

    const n = Math.max(x.toString().length, y.toString().length);
    const m = Math.ceil(n / 2);
    const base = 10 ** m;

    const a = Math.floor(x / base);
    const b = x % base;
    const c = Math.floor(y / base);
    const d = y % base;

    const z0 = karatsuba(b, d, nodeId);
    const z1 = karatsuba(a + b, c + d, nodeId);
    const z2 = karatsuba(a, c, nodeId);

    const result = z2 * 10 ** (2 * m) + (z1 - z2 - z0) * 10 ** m + z0;

    node.result = result;
    node.steps = {
      split: { a, b, c, d, m },
      zValues: { z0, z1, z2 },
      formula: `z2·10^(2m) + (z1 − z2 − z0)·10^m + z0`,
      substituted: `${z2}·10^${2 * m} + (${z1}−${z2}−${z0})·10^${m} + ${z0}`,
      value: result,
    };

    return result;
  }

  const finalResult = karatsuba(x0, y0, null);
  return { nodes, edges, finalResult };
}

// ================= MAXIMUM SUBARRAY =================

function buildMaxSubarrayTreeFromInput(arr) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function solve(l, r, parentId = null) {
    const nodeId = id++;
    const node = {
      id: nodeId,
      label: `MS(${l},${r})`,
      depth: parentId === null ? 0 : nodes[parentId].depth + 1,
      result: null,
    };
    nodes.push(node);

    if (parentId !== null) edges.push({ from: parentId, to: nodeId });

    // Base case
    if (l === r) {
      node.result = { sum: arr[l], l, r };
      return node.result;
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

    const cross = { sum: leftMax + rightMax, l: bestL, r: bestR };

    const crossId = id++;
    nodes.push({
      id: crossId,
      label: `Cross(${l}-${r})`,
      depth: node.depth + 1,
      result: cross,
    });
    edges.push({ from: nodeId, to: crossId });

    let best;
    if (left.sum >= right.sum && left.sum >= cross.sum) best = left;
    else if (right.sum >= left.sum && right.sum >= cross.sum) best = right;
    else best = cross;

    node.result = best;
    return best;
  }

  const result = solve(0, arr.length - 1, null);
  return { nodes, edges, finalResult: result };
}
