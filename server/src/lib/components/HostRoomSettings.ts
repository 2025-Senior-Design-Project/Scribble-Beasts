import type { RoomSettings } from '../../../../shared/settings/index.js';

const hostRoomSettings: Record<string, RoomSettings> = {};

function cloneSettings(settings: RoomSettings): RoomSettings {
  return {
    ...settings,
    roundTimers: { ...settings.roundTimers },
  };
}

export function getHostRoomSettings(hostName: string): RoomSettings | undefined {
  const settings = hostRoomSettings[hostName];
  if (!settings) return undefined;
  return cloneSettings(settings);
}

export function setHostRoomSettings(
  hostName: string,
  settings: RoomSettings,
): void {
  hostRoomSettings[hostName] = cloneSettings(settings);
}

export function clearHostRoomSettingsForTests(): void {
  Object.keys(hostRoomSettings).forEach((hostName) => {
    delete hostRoomSettings[hostName];
  });
}
