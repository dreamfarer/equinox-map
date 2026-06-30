// Set to an ISO 8601 date string to force users who completed before that date to redo the tour.
// Leave as undefined to treat any stored date as "done".
export const TUTORIAL_REQUIRED_AFTER: string | undefined = undefined;
export const WHATS_NEW_REQUIRED_AFTER: string | undefined = undefined;

export function shouldShowTutorial(
    tutorialDoneAt: string | undefined
): boolean {
    if (!tutorialDoneAt) return true;
    return !!(
        TUTORIAL_REQUIRED_AFTER && tutorialDoneAt < TUTORIAL_REQUIRED_AFTER
    );
}

export function shouldShowWhatsNew(
    tutorialDoneAt: string | undefined,
    whatsNewSeenAt: string | undefined
): boolean {
    if (shouldShowTutorial(tutorialDoneAt)) return false;
    if (!whatsNewSeenAt) return true;
    return !!(
        WHATS_NEW_REQUIRED_AFTER && whatsNewSeenAt < WHATS_NEW_REQUIRED_AFTER
    );
}
