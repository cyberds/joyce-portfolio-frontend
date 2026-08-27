/**
 * Scroll progress for the journey lives outside React on purpose: the 3D scene
 * reads it every frame, so writing it must never trigger a render.
 */
export const journeyScroll = { progress: 0 };

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
