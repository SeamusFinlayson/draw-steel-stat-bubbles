import Token from "../TokenClass";
import "../index.css";
import { useEffect, useReducer, useState } from "react";
import { Action, BulkEditorState, Operation } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { DamageTable, SetValuesTable } from "./Tables";
import {
  getIncluded,
  getRollsFromScene,
  reducer,
  unsetStatOverwrites,
  writeTokenSortingToItems,
} from "./helpers";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { itemFilter, parseItems } from "@/itemHelpers";
import { addThemeToBody } from "@/colorHelpers";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";

export default function BulkEditor(): JSX.Element {
  // App state
  const [appState, dispatch] = useReducer(reducer, {}, (): BulkEditorState => {
    return {
      operation: "none",
      showItems: "SELECTED",
      rolls: [],
      value: null,
      animateRoll: false,
      statOverwrites: unsetStatOverwrites(),
      damageScaleOptions: new Map<string, number>(),
      includedItems: new Map<string, boolean>(),
    };
  });

  // Scene State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [playerSelection, setPlayerSelection] = useState<string[]>([]);
  const [playerRole, setPlayerRole] = useState<"PLAYER" | "GM">("PLAYER");
  const [sceneReady, setSceneReady] = useState(false);

  // Tokens filter state
  const [mostRecentSelection, setMostRecentSelection] =
    useState<string[]>(playerSelection);

  const selectedTokens = tokens.filter(
    (token) =>
      (appState.showItems === "ALL" ||
        mostRecentSelection.includes(token.item.id) ||
        getIncluded(token.item.id, appState.includedItems)) &&
      (playerRole === "GM" || !token.hideStats) &&
      !(appState.operation === "damage" && token.maxHealth <= 0) &&
      !(appState.operation === "healing" && token.maxHealth <= 0),
  );

  function handleDragEnd(event: DragEndEvent) {
    //group is unhandled
    const { active, over } = event;
    if (over?.id && active.id !== over.id) {
      setTokens((tokens) => {
        const oldIndex = tokens.find(
          (token) => token.item.id === active.id,
        )?.index;
        const newIndex = tokens.find(
          (token) => token.item.id === over.id,
        )?.index;
        const newTokens = arrayMove(
          tokens,
          oldIndex as number,
          newIndex as number,
        );
        for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;

        writeTokenSortingToItems(newTokens);
        return newTokens;
      });
    }
  }

  // Sync tokens with scene
  const updateTokens = (items: Item[]) => {
    const newTokens = parseItems(items);
    // Guarantee initialized and ordered indices
    newTokens.sort(
      (a, b) =>
        (a.index === -1 ? newTokens.length : a.index) -
        (b.index === -1 ? newTokens.length : b.index),
    );
    for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;
    setTokens(newTokens);
  };
  useEffect(() => {
    return OBR.scene.items.onChange(updateTokens);
  }, []);

  // Handle room ready
  useEffect(() => {
    const handleReady = (ready: boolean) => {
      setSceneReady(ready);
      if (ready) {
        OBR.scene.items.getItems(itemFilter).then(updateTokens);
        getRollsFromScene().then((rolls) =>
          dispatch({
            type: "set-rolls",
            rolls: rolls,
          }),
        );
      } else {
        setTokens([]);
      }
    };
    OBR.scene.isReady().then(handleReady);
    return OBR.scene.onReadyChange(handleReady);
  }, []);

  // Sync player
  useEffect(() => {
    const updateSelection = (selection: string[] | undefined) => {
      setPlayerSelection(selection ? selection : []);
      if (selection) setMostRecentSelection(selection);
    };
    const updatePlayerRole = (role: "PLAYER" | "GM") => {
      setPlayerRole(role);
      if (role === "PLAYER")
        dispatch({ type: "set-operation", operation: "none" });
    };
    OBR.player.getSelection().then(updateSelection);
    OBR.player.getRole().then(updatePlayerRole);
    return OBR.player.onChange((player) => {
      updateSelection(player.selection);
      updatePlayerRole(player.role);
    });
  }, []);

  // Sync rolls
  useEffect(
    OBR.scene.onMetadataChange(async (sceneMetadata) => {
      if (sceneReady)
        dispatch({
          type: "set-rolls",
          rolls: await getRollsFromScene(sceneMetadata),
        });
    }),
    [],
  );

  // Sync theme
  useEffect(
    () => OBR.theme.onChange((theme) => addThemeToBody(theme.mode)),
    [],
  );

  useEffect(() => {
    const newValue = appState.rolls[0]?.total;
    if (newValue !== undefined)
      dispatch({ type: "set-value", value: newValue });
  }, [appState.rolls[0]?.total]);

  const getTable = (operation: Operation) => {
    if (selectedTokens.length === 0)
      return (
        <div className="flex h-full items-start justify-center p-2 text-mirage-400 dark:text-mirage-600">
          The tokens you most recently selected on the map will be visible here.
        </div>
      );
    switch (operation) {
      case "damage":
        return (
          <DamageTable
            tokens={selectedTokens}
            appState={appState}
            dispatch={dispatch}
            playerSelection={playerSelection}
          ></DamageTable>
        );
      default:
        return (
          <SetValuesTable
            appState={appState}
            dispatch={dispatch}
            tokens={selectedTokens}
            setTokens={setTokens}
            playerRole={playerRole}
            playerSelection={playerSelection}
            handleDragEnd={handleDragEnd}
          ></SetValuesTable>
        );
    }
  };

  return (
    <div className="h-full overflow-clip">
      <div className="flex h-full flex-col justify-between bg-mirage-100/90 dark:bg-mirage-940/85 dark:text-mirage-200">
        <Header
          appState={appState}
          dispatch={dispatch}
          playerRole={playerRole}
        ></Header>
        <ScrollArea className="h-full sm:px-4">
          <div className="flex flex-col items-center justify-start gap-2 pb-2">
            {getTable(appState.operation)}
            <ChangeShowItemsButton appState={appState} dispatch={dispatch} />
          </div>
          <ScrollBar orientation="horizontal" forceMount />
        </ScrollArea>
        <Footer
          tokens={selectedTokens}
          appState={appState}
          dispatch={dispatch}
        ></Footer>
      </div>
    </div>
  );
}

function ChangeShowItemsButton({
  appState,
  dispatch,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  return (
    <Button
      variant={"ghost"}
      onClick={() =>
        dispatch({
          type: "set-show-items",
          showItems: appState.showItems === "ALL" ? "SELECTED" : "ALL",
        })
      }
    >
      {appState.showItems === "ALL"
        ? "Show Only Selected Tokens"
        : "Show All Tokens"}
    </Button>
  );
}