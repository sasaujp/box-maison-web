import { proxy } from "valtio";
import { myState } from "./avater";
import { houseBoxState } from "./meison";
import { derive } from "valtio/utils";

export const colorPicker = proxy({
  isOpen: false,
});

export const svgRectState = proxy({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

export const zoomState = proxy({
  value: 0,
});

function easeOutCirc(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}

const calcSmoothBounce = (
  pos: number,
  viewSize: number,
  roomStart: number,
  roomSize: number,
  easeFunc: (x: number) => number
) => {
  // 端から画面サイズの半分の位置で調整を開始
  const edgeThreshold = Math.min(viewSize * 0.7, (roomSize - roomStart) * 0.5);
  let bounce = 0;
  if (pos < roomStart + edgeThreshold) {
    const factor = (roomStart + edgeThreshold - pos) * 0.5;
    bounce = factor;
    bounce = easeFunc(factor / (edgeThreshold / 2)) * factor;
  } else if (pos > roomStart + roomSize - edgeThreshold) {
    const factor = -(pos - (roomStart + roomSize - edgeThreshold)) * 0.5;
    bounce = easeFunc(-factor / (edgeThreshold / 2)) * factor;
  }

  return bounce;
};

export const viewboxState = derive({
  value: (get) => {
    const rect = get(svgRectState);
    const position = get(myState).position;
    const houseBox = get(houseBoxState).value;
    const zoom = get(zoomState).value;

    const bounceX = calcSmoothBounce(
      position.x,
      rect.width,
      houseBox.x,
      houseBox.width,
      easeOutCirc
    );
    const bounceY = calcSmoothBounce(
      position.y,
      rect.height,
      houseBox.y,
      houseBox.height,
      easeOutCirc
    );
    return {
      x: rect.x + position.x - rect.width / 2 + bounceX,
      y: rect.y + position.y - rect.height / 2 + bounceY,
      width: rect.width * zoom,
      height: rect.height,
    };
  },
});
