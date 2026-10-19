/**
 * Hook that manages cloud synchronization lifecycle.
 * - Local changes are sent to Firestore when saving if sync toggle is enabled (Push).
 * - Cloud data is pulled to local storage on-demand via the dedicated button in Settings (Pull).
 */
export const useCloudSync = () => {
  // Sync operates explicitly via saveSchedule / person actions and manual pull in Settings.
};
