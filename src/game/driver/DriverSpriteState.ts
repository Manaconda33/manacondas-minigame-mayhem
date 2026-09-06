export type DriverFrame =
  | 'rear'
  | 'front'
  | 'steerLeft'
  | 'steerRight'
  | 'hit'
  | 'victory'
  | 'frontSteerLeft'
  | 'frontSteerRight'
  | 'frontHit'
  | 'frontVictory';

export interface DriverSpriteState {
  finished: boolean;
  frontFacingCamera: boolean;
  hitSeconds: number;
  spinoutSeconds?: number;
  steering: number;
}

export type LocalPosition3 = readonly [number, number, number];
export type DriverFramePositionOverrides = Partial<Record<DriverFrame, LocalPosition3>>;

interface HorizontalVector {
  x: number;
  z: number;
}

export function isDriverFrontFacingCamera(
  racerPosition: HorizontalVector,
  racerForward: HorizontalVector,
  cameraPosition: HorizontalVector,
): boolean {
  const toCameraX = cameraPosition.x - racerPosition.x;
  const toCameraZ = cameraPosition.z - racerPosition.z;
  return racerForward.x * toCameraX + racerForward.z * toCameraZ > 0;
}

export function selectDriverFrame(state: DriverSpriteState): DriverFrame {
  if ((state.spinoutSeconds ?? 0) > 0) return state.frontFacingCamera ? 'frontHit' : 'hit';
  if (state.finished) return state.frontFacingCamera ? 'frontVictory' : 'victory';
  if (state.hitSeconds > 0) return state.frontFacingCamera ? 'frontHit' : 'hit';
  if (state.steering > 0.15) return state.frontFacingCamera ? 'frontSteerLeft' : 'steerLeft';
  if (state.steering < -0.15) return state.frontFacingCamera ? 'frontSteerRight' : 'steerRight';
  return state.frontFacingCamera ? 'front' : 'rear';
}

export function isFrontFacingDriverFrame(frame: DriverFrame): boolean {
  return (
    frame === 'front' ||
    frame === 'frontSteerLeft' ||
    frame === 'frontSteerRight' ||
    frame === 'frontHit' ||
    frame === 'frontVictory'
  );
}

export function driverFrameFallbacks(frame: DriverFrame): readonly DriverFrame[] {
  if (frame === 'front') return ['front', 'rear'];
  if (isFrontFacingDriverFrame(frame)) return [frame, 'front', 'rear'];
  if (frame === 'rear') return ['rear'];
  return [frame, 'rear'];
}

export function driverSpritePosition(
  frame: DriverFrame,
  defaultPosition: LocalPosition3,
  frontPosition?: LocalPosition3,
  framePositions?: DriverFramePositionOverrides,
): LocalPosition3 {
  return (
    framePositions?.[frame] ??
    (isFrontFacingDriverFrame(frame) && frontPosition !== undefined
      ? frontPosition
      : defaultPosition)
  );
}

export function shouldShowModeledSteeringControl(
  driverSpriteIncludesSteeringControl: boolean,
  frame: DriverFrame,
): boolean {
  return !driverSpriteIncludesSteeringControl || isFrontFacingDriverFrame(frame);
}

export function modeledSteeringControlPosition(
  frame: DriverFrame,
  defaultPosition: LocalPosition3,
  frontPosition?: LocalPosition3,
): LocalPosition3 {
  return isFrontFacingDriverFrame(frame) && frontPosition !== undefined
    ? frontPosition
    : defaultPosition;
}
