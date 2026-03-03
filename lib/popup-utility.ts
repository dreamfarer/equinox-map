/**
 * Calculate the popup offset dependent on the anchor.
 */
export function calculatePopupOffset(
    anchor: string
): Record<string, [number, number]> {
    return anchor === 'center'
        ? {
              top: [0, 0],
              bottom: [0, -25],
              left: [0, 0],
              right: [0, 0],
              'top-left': [0, 0],
              'top-right': [0, 0],
              'bottom-left': [0, 0],
              'bottom-right': [0, 0],
          }
        : {
              top: [0, 0],
              bottom: [0, -45],
              left: [0, 0],
              right: [0, 0],
              'top-left': [0, 0],
              'top-right': [0, 0],
              'bottom-left': [0, 0],
              'bottom-right': [0, 0],
          };
}
