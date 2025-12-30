let currentTree = null;
let stepOrder = [];
let currentStepIndex = -1;

function layoutTree(tree, svgWidth, levelHeight) {
  const depthMap = new Map();

  tree.nodes.forEach((node) => {
    if (!depthMap.has(node.depth)) depthMap.set(node.depth, []);
    depthMap.get(node.depth).push(node);
  });

  const positionedNodes = new Map();
  const maxDepth = Math.max(...tree.nodes.map((n) => n.depth));

  for (let d = 0; d <= maxDepth; d++) {
    const levelNodes = depthMap.get(d) || [];
    const count = levelNodes.length;
    levelNodes.forEach((node, index) => {
      const x = ((index + 1) / (count + 1)) * svgWidth;
      const y = 40 + d * levelHeight;
      positionedNodes.set(node.id, { ...node, x, y });
    });
  }

  return {
    nodes: Array.from(positionedNodes.values()),
    edges: tree.edges.map((e) => ({
      ...e,
      fromPos: positionedNodes.get(e.from),
      toPos: positionedNodes.get(e.to),
    })),
  };
}

function renderTree(tree, svgElem) {
  currentTree = tree;

  const width = svgElem.clientWidth || 800;
  const levelHeight = 90;

  const laidOut = layoutTree(tree, width - 40, levelHeight);
  const maxDepth = Math.max(...laidOut.nodes.map((n) => n.depth));
  const height = 40 + (maxDepth + 1) * levelHeight;

  svgElem.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgElem.innerHTML = "";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  marker.setAttribute("id", "arrowHead");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "8");
  marker.setAttribute("refX", "6");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto-start-reverse");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M0,0 L6,3 L0,6 z");
  path.setAttribute("fill", "#e5e7eb");

  marker.appendChild(path);
  defs.appendChild(marker);
  svgElem.appendChild(defs);

  laidOut.edges.forEach((edge, index) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("edge", "hidden-step");
    line.setAttribute("data-edge-index", index.toString());

    line.setAttribute("x1", edge.fromPos.x);
    line.setAttribute("y1", edge.fromPos.y + 16);
    line.setAttribute("x2", edge.toPos.x);
    line.setAttribute("y2", edge.toPos.y - 16);

    svgElem.appendChild(line);
  });

  laidOut.nodes.forEach((node, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.setAttribute("data-node-id", node.id);
    group.classList.add("hidden-step");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", "18");
    circle.classList.add("node");

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.textContent = node.label;
    label.classList.add("node-label");
    label.setAttribute("y", "0");

    group.appendChild(circle);
    group.appendChild(label);
    svgElem.appendChild(group);
  });

  const adj = new Map();
  laidOut.edges.forEach((e) => {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  });

  stepOrder = [];
  const root = laidOut.nodes.find((n) => n.depth === 0);
  const q = [root.id];
  const visited = new Set();
  visited.add(root.id);

  while (q.length) {
    const u = q.shift();
    stepOrder.push(u);
    const children = adj.get(u) || [];
    for (const v of children) {
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
      }
    }
  }

  currentStepIndex = -1;
  updateStep(svgElem, 0);
}

function updateStep(svgElem, newIndex) {
  if (!currentTree || stepOrder.length === 0) return;

  if (newIndex < 0) newIndex = 0;
  if (newIndex >= stepOrder.length) newIndex = stepOrder.length - 1;
  currentStepIndex = newIndex;

  const allNodeGroups = svgElem.querySelectorAll("g[data-node-id]");
  const allEdges = svgElem.querySelectorAll(".edge");

  allNodeGroups.forEach((group) => {
    group.classList.add("hidden-step");
    group.classList.remove("current-step");
  });
  allEdges.forEach((edge) => {
    edge.classList.add("hidden-step");
    edge.classList.remove("active");
  });

  const visibleSet = new Set(stepOrder.slice(0, currentStepIndex + 1));

  allNodeGroups.forEach((group) => {
    const id = parseInt(group.getAttribute("data-node-id"), 10);
    if (visibleSet.has(id)) {
      group.classList.remove("hidden-step");
    }
    if (id === stepOrder[currentStepIndex]) {
      group.classList.add("current-step");
    }
  });

  allEdges.forEach((edge) => {
    const index = parseInt(edge.getAttribute("data-edge-index"), 10);
    const logicalEdge = currentTree.edges[index];
    if (visibleSet.has(logicalEdge.to)) {
      edge.classList.remove("hidden-step");
      if (logicalEdge.to === stepOrder[currentStepIndex]) {
        edge.classList.add("active");
      }
    }
  });
}
