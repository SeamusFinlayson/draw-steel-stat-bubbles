import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import menuIcon from "@/menuIcon";
import { Settings } from "@/metadataHelpers/settingMetadataHelpers";

const NAME_HEIGHT = 44;
const STATS_HEIGHT = 192;
const HIDE_HEIGHT = 40;
const PADDING = 8;

export default async function createContextMenuItems(
  settings: Settings,
  themeMode: "DARK" | "LIGHT",
) {
  let menuHeight = STATS_HEIGHT + PADDING;
  if (settings.nameTags) menuHeight += NAME_HEIGHT;

  createPlayerMenu(themeMode, menuHeight);
  createGmMenu(themeMode, menuHeight + HIDE_HEIGHT);
  // createDamageToolContextItem(themeMode);
}

function createPlayerMenu(
  themeMode: "DARK" | "LIGHT",
  playerMenuHeight: number,
) {
  OBR.contextMenu.create({
    id: getPluginId("player-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Edit Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            {
              key: ["metadata", getPluginId("metadata"), "gmOnly"],
              value: true,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: playerMenuHeight,
    },
  });
}

function createGmMenu(themeMode: "DARK" | "LIGHT", gmMenuHeight: number) {
  OBR.contextMenu.create({
    id: getPluginId("gm-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Edit Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
          ],
          roles: ["GM"],
          max: 1,
        },
      },
    ],
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: gmMenuHeight,
    },
  });
}
