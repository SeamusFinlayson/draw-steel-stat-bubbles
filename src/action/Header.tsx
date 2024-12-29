import { Button } from "@/components/ui/button";
import { GearIcon } from "@radix-ui/react-icons";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "@/getPluginId";
import LinkButton from "@/settings/LinkButton";
import { Patreon } from "@/components/icons/Patreon";
import { QuestionMark } from "@/components/icons/QuestionMark";
import { History } from "@/components/icons/History";
import { Bug } from "@/components/icons/bug";

export default function Header({
  playerRole,
}: {
  playerRole: "PLAYER" | "GM";
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 p-4 pb-2 pt-3">
      {/* <Command
        dispatch={dispatch}
        playerRole={playerRole}
        playerName={playerName}
      ></Command> */}
      <h1 className="self w-full">Stat Bubbles</h1>
      {playerRole === "GM" ? (
        <>
          <Button
            size={"icon"}
            variant={"outline"}
            className="shrink-0"
            onClick={async () => {
              const themeMode = (await OBR.theme.getTheme()).mode;
              OBR.popover.open({
                id: getPluginId("settings"),
                url: `/src/settings/settings.html?themeMode=${themeMode}`,
                height: 500,
                width: 400,
              });
            }}
          >
            <GearIcon className="size-5" />
          </Button>
        </>
      ) : (
        <div className="flex gap-2">
          <LinkButton
            name="Patreon"
            icon={<Patreon />}
            href={"https://www.patreon.com/SeamusFinlayson"}
          />
          <LinkButton
            name="Change Log"
            icon={<History />}
            href={"https://www.patreon.com/collection/306916?view=expanded"}
          />
          <LinkButton
            name="Instructions"
            icon={<QuestionMark />}
            href={
              "https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo?tab=readme-ov-file#how-it-works"
            }
          />
          <LinkButton
            name="Report Bug"
            icon={<Bug />}
            href="https://discord.gg/WMp9bky4be"
          />
        </div>
      )}
    </div>
  );
}
