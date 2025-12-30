// js/algorithms.js
// Dynamic recursion tree builders (NO UI changes)

function buildKaratsubaTreeFromInput(maxDepth) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function karatsuba(x, y, depth, parentId = null) {
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      label: `K(${x}, ${y})`,
      depth,
    });

    if (parentId !== null) {
      edges.push({ from: parentId, to: nodeId });
    }

    if (x < 10 || y < 10 || depth >= maxDepth - 1) {
      return nodeId;
    }

    const n = Math.max(x.toString().length, y.toString().length);
    const m = Math.floor(n / 2);

    const a = Math.floor(x / 10 ** m);
    const b = x % 10 ** m;
    const c = Math.floor(y / 10 ** m);
    const d = y % 10 ** m;

    karatsuba(b, d, depth + 1, nodeId); // z0
    karatsuba(a + b, c + d, depth + 1, nodeId); // z1
    karatsuba(a, c, depth + 1, nodeId); // z2

    return nodeId;
  }

  karatsuba(1234, 5678, 0, null);
  return { nodes, edges };
}

function buildMaxSubarrayTreeFromInput(maxDepth) {
  const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  const nodes = [];
  const edges = [];
  let id = 0;

  function solve(l, r, depth, parentId = null) {
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      label: `MS(${l}, ${r})`,
      depth,
    });

    if (parentId !== null) {
      edges.push({ from: parentId, to: nodeId });
    }

    if (l === r || depth >= maxDepth - 1) {
      return nodeId;
    }

    const mid = Math.floor((l + r) / 2);

    solve(l, mid, depth + 1, nodeId);
    solve(mid + 1, r, depth + 1, nodeId);

    const crossId = id++;
    nodes.push({
      id: crossId,
      label: `Cross(${l}-${r})`,
      depth: depth + 1,
    });
    edges.push({ from: nodeId, to: crossId });

    return nodeId;
  }

  solve(0, arr.length - 1, 0, null);
  return { nodes, edges };
}
