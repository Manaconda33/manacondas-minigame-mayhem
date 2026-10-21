declare module '*neon-grid-owner-layout-capture-schema.mjs' {
  export interface OwnerLayoutCaptureCoverage {
    scenario: string;
    viewport: string;
    view: string;
  }

  export interface OwnerLayoutCapturePair {
    scenario: string;
    viewport: string;
    view: string;
    sameCamera: true;
    sameRoute: true;
    sameColliders: true;
    sameResources: true;
    sameDrawCalls: true;
    frameTriangleDelta: number;
    expectedScreenRangeTriangles: number;
    expectedWholeFrameScreenDelta: number;
    aScreenshotSha256: string;
    bScreenshotSha256: string;
  }

  export const OWNER_LAYOUT_SOURCE_SHA256: string;
  export const OWNER_LAYOUT_SCREEN_ID: string;
  export const OWNER_LAYOUT_SCREEN_TRIANGLES: number;
  export const OWNER_LAYOUT_CAPTURE_COVERAGE: readonly OwnerLayoutCaptureCoverage[];
  export const OWNER_LAYOUT_NONSCREEN_DELETED_IDS: readonly string[];

  export function validateOwnerLayoutCapture(report: unknown): {
    valid: true;
    captureCount: number;
    pairCount: number;
    paired: OwnerLayoutCapturePair[];
  };
}
