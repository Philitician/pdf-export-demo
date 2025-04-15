export const drawingNodes = [
  {
    pageNr: 1,
    id: "gxg5b5dxrvrghidhli4zbgs5skzu",
    type: "symbol-node",
    position: {
      x: 0,
      y: 0,
    },
    data: {
      svgData:
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">\n  <path stroke="currentColor" d="M9 9h22M9 9v22M9 9l11 11M31 9v22m0-22L20 20m11 11H9m22 0L20 20M9 31l11-11m-8-8h16v16H12V12Z" fill="none"/>\n</svg>\n',
      symbolId: 1027,
      drawingLayerId: 121,
      size: "md",
      color: "Rød",
      rotation: 0,
      createdAt: "2025-04-15T13:16:13.204Z",
    },
    selectable: false,
    draggable: false,
    measured: {
      width: 22,
      height: 22,
    },
    selected: false,
  },
];

export type DrawingNode = (typeof drawingNodes)[number];
