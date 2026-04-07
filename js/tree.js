let currentTree = null;
let stepOrder = [];
let currentStepIndex = -1;

function rerenderCurrentTree(svgElem) {
  if (!currentTree || !svgElem) return;

  const savedStepIndex = currentStepIndex;
  renderTree(currentTree, svgElem);
  updateStep(svgElem, savedStepIndex);
}

function layoutTree(tree, svgWidth, levelHeight) {
  const NODE_R = 28;
  const MIN_SIBLING_GAP = 20;

  const children = new Map();
  tree.nodes.forEach((node) => children.set(node.id, []));
  tree.edges.forEach((edge) => children.get(edge.from).push(edge.to));

  const root = tree.nodes.find((node) => node.depth === 0);

  const subtreeWidth = new Map();
  function computeWidth(id) {
    const kids = children.get(id) || [];
    if (kids.length === 0) {
      subtreeWidth.set(id, 2 * NODE_R);
      return;
    }

    kids.forEach(computeWidth);
    const total =
      kids.reduce((sum, kidId) => sum + subtreeWidth.get(kidId), 0) +
      (kids.length - 1) * MIN_SIBLING_GAP;
    subtreeWidth.set(id, Math.max(total, 2 * NODE_R));
  }
  computeWidth(root.id);

  const posX = new Map();
  const posY = new Map();

  function assignPos(id, left, depth) {
    const width = subtreeWidth.get(id);
    const centerX = left + width / 2;
    posX.set(id, centerX);
    posY.set(id, 56 + depth * levelHeight);

    const kids = children.get(id) || [];
    let cursor = left;
    kids.forEach((kidId) => {
      assignPos(kidId, cursor, depth + 1);
      cursor += subtreeWidth.get(kidId) + MIN_SIBLING_GAP;
    });
  }

  const rootWidth = subtreeWidth.get(root.id);
  const startX = Math.max(0, (svgWidth - rootWidth) / 2);
  assignPos(root.id, startX, 0);

  const positionedNodes = new Map();
  tree.nodes.forEach((node) => {
    positionedNodes.set(node.id, {
      ...node,
      x: posX.get(node.id),
      y: posY.get(node.id),
    });
  });

  return {
    nodes: Array.from(positionedNodes.values()),
    edges: tree.edges.map((edge) => ({
      ...edge,
      fromPos: positionedNodes.get(edge.from),
      toPos: positionedNodes.get(edge.to),
    })),
  };
}

function getCalcLines(node) {
  if (!node.steps && !node.result) return [];
  const lines = [];

  if (node.steps) {
    if (node.steps.type === "base") {
      lines.push(node.steps.calculation + " = " + node.steps.value);
    } else if (node.steps.split) {
      const { a, b, c, d, m } = node.steps.split;
      const { z0, z1, z2 } = node.steps.zValues;
      lines.push(`m=${m}  a=${a} b=${b} c=${c} d=${d}`);
      lines.push(`z0=${z0}  z1=${z1}  z2=${z2}`);
      lines.push(`= ${node.steps.value}`);
    }
  }

  if (!node.steps && node.result) {
    const result = node.result;
    if (result !== null && typeof result === "object") {
      lines.push(`sum = ${result.sum}`);
      lines.push(`idx [${result.l}, ${result.r}]`);
    }
  }

  return lines;
}

function renderTree(tree, svgElem) {
  currentTree = tree;

  const NODE_R = 28;
  const LEVEL_HEIGHT = 142;
  const PADDING = 44;

  const containerW = svgElem.parentElement
    ? svgElem.parentElement.clientWidth || 800
    : 800;
  const containerH = svgElem.parentElement
    ? svgElem.parentElement.clientHeight || 620
    : 620;

  const laidOut = layoutTree(
    tree,
    Math.max(containerW - PADDING * 2, 340),
    LEVEL_HEIGHT,
  );
  const maxX = Math.max(...laidOut.nodes.map((node) => node.x)) + NODE_R + PADDING;
  const maxDepth = Math.max(...laidOut.nodes.map((node) => node.depth));
  const contentW = maxX + PADDING;
  const contentH = 56 + (maxDepth + 1) * LEVEL_HEIGHT + 132;

  const fitScale = Math.min(
    (containerW - PADDING * 2) / contentW,
    (containerH - PADDING * 2) / contentH,
  );
  const scale = Math.max(0.95, Math.min(2.4, fitScale));
  const svgW = Math.max(containerW, Math.ceil(contentW * scale + PADDING * 2));
  const svgH = Math.max(containerH, Math.ceil(contentH * scale + PADDING * 2));
  const offsetX = Math.max(PADDING, (svgW - contentW * scale) / 2);
  const offsetY = Math.max(PADDING * 0.75, (svgH - contentH * scale) / 2);

  svgElem.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
  svgElem.setAttribute("width", svgW);
  svgElem.setAttribute("height", svgH);
  svgElem.innerHTML = "";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker",
  );
  marker.setAttribute("id", "arrowHead");
  marker.setAttribute("markerWidth", "7");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "5");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto-start-reverse");

  const arrowPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  arrowPath.setAttribute("d", "M0,0 L7,3.5 L0,7 z");
  arrowPath.setAttribute("fill", "rgba(128,109,86,0.7)");
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svgElem.appendChild(defs);

  const scene = document.createElementNS("http://www.w3.org/2000/svg", "g");
  scene.setAttribute(
    "transform",
    `translate(${offsetX}, ${offsetY}) scale(${scale})`,
  );
  svgElem.appendChild(scene);

  laidOut.edges.forEach((edge, index) => {
    const dx = edge.toPos.x - edge.fromPos.x;
    const dy = edge.toPos.y - edge.fromPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("edge", "hidden-step");
    line.setAttribute("data-edge-index", index.toString());
    line.setAttribute("x1", edge.fromPos.x + nx * NODE_R);
    line.setAttribute("y1", edge.fromPos.y + ny * NODE_R);
    line.setAttribute("x2", edge.toPos.x - nx * (NODE_R + 5));
    line.setAttribute("y2", edge.toPos.y - ny * (NODE_R + 5));
    scene.appendChild(line);
  });

  laidOut.nodes.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.setAttribute("data-node-id", node.id);
    group.classList.add("hidden-step");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("r", NODE_R);
    circle.classList.add("node");

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.textContent = node.label;
    label.classList.add("node-label");

    group.appendChild(circle);
    group.appendChild(label);

    const calcLines = getCalcLines(node);
    if (calcLines.length > 0) {
      const lineH = 16;
      const bubblePad = 9;
      const bubbleW =
        Math.max(...calcLines.map((line) => line.length)) * 7.1 + bubblePad * 2;
      const bubbleH = calcLines.length * lineH + bubblePad * 2;
      const bubbleY = NODE_R + 14;

      const bubbleBg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      bubbleBg.setAttribute("x", -bubbleW / 2);
      bubbleBg.setAttribute("y", bubbleY);
      bubbleBg.setAttribute("width", bubbleW);
      bubbleBg.setAttribute("height", bubbleH);
      bubbleBg.setAttribute("rx", 6);
      bubbleBg.setAttribute("ry", 6);
      bubbleBg.classList.add("calc-bg");
      group.appendChild(bubbleBg);

      calcLines.forEach((line, index) => {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.textContent = line;
        text.classList.add("calc-bubble");
        text.setAttribute("y", bubbleY + bubblePad + lineH * index + lineH * 0.75);
        group.appendChild(text);
      });
    }

    scene.appendChild(group);
  });

  const adjacency = new Map();
  laidOut.edges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge.to);
  });

  stepOrder = [];
  const root = laidOut.nodes.find((node) => node.depth === 0);
  const queue = [root.id];
  const visited = new Set([root.id]);

  while (queue.length) {
    const nodeId = queue.shift();
    stepOrder.push(nodeId);
    (adjacency.get(nodeId) || []).forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push(childId);
      }
    });
  }

  currentStepIndex = -1;
  updateStep(svgElem, 0);
  updateStepCounter();

  const wrapper = svgElem.parentElement;
  if (wrapper) {
    wrapper.scrollLeft = Math.max(0, (svgW - wrapper.clientWidth) / 2);
    wrapper.scrollTop = 0;
  }
}

function updateStep(svgElem, newIndex) {
  if (!currentTree || stepOrder.length === 0) return;

  newIndex = Math.max(0, Math.min(newIndex, stepOrder.length - 1));
  currentStepIndex = newIndex;

  const visibleSet = new Set(stepOrder.slice(0, currentStepIndex + 1));
  const currentNodeId = stepOrder[currentStepIndex];

  svgElem.querySelectorAll("g[data-node-id]").forEach((group) => {
    const id = parseInt(group.getAttribute("data-node-id"), 10);
    const isVisible = visibleSet.has(id);
    const isCurrent = id === currentNodeId;

    group.classList.toggle("hidden-step", !isVisible);
    group.classList.toggle("current-step", isCurrent);

    group
      .querySelectorAll(".calc-bubble")
      .forEach((el) => el.classList.toggle("visible", isCurrent));
    group
      .querySelectorAll(".calc-bg")
      .forEach((el) => el.classList.toggle("visible", isCurrent));
  });

  svgElem.querySelectorAll(".edge").forEach((edge) => {
    const index = parseInt(edge.getAttribute("data-edge-index"), 10);
    const logicalEdge = currentTree.edges[index];
    const isVisible = visibleSet.has(logicalEdge.to);
    const isCurrent = logicalEdge.to === currentNodeId;

    edge.classList.toggle("hidden-step", !isVisible);
    edge.classList.toggle("active", isCurrent);
  });

  updateStepCounter();
}

function updateStepCounter() {
  const counter = document.getElementById("stepCounter");
  if (counter && stepOrder.length > 0) {
    counter.textContent = `Step ${currentStepIndex + 1} / ${stepOrder.length}`;
  }
}
