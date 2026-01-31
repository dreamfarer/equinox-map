/**
 * Calculate the popup offset dependent on the anchor.
 */
export function calculatePopupOffset(
    anchor: string
): Record<string, [number, number]> {
    return anchor === 'center'
        ? {
              top: [0, 20],
              bottom: [0, -20],
              left: [20, 0],
              right: [-20, 0],
              'top-left': [17, 17],
              'top-right': [-17, 17],
              'bottom-left': [17, -17],
              'bottom-right': [-17, -17],
          }
        : {
              top: [0, 5],
              bottom: [0, -40],
              left: [18, -18],
              right: [-18, -18],
              'top-left': [12, 0],
              'top-right': [-12, 0],
              'bottom-left': [14, -32],
              'bottom-right': [-14, -32],
          };
}