import * as clc from "cli-color";
import * as _ from "lodash";
import { prompt } from "../../prompt";
import { Emulators, ALL_EMULATORS, isJavaEmulator } from "../../emulator/types";
import { Constants } from "../../emulator/constants";
import { downloadIfNecessary } from "../../serve/javaEmulators";

interface EmulatorsInitSelections {
  emulators?: Emulators[];
  download?: boolean;
}

export async function doSetup(setup: any, config: any) {
  const choices = ALL_EMULATORS.map((e) => {
    return {
      value: e,
      name: _.capitalize(e),
      checked: false,
    };
  });

  console.log(JSON.stringify(choices));

  const selections: EmulatorsInitSelections = {};
  await prompt(selections, [
    {
      type: "checkbox",
      name: "emulators",
      message:
        "Which Firebase emulators do you want to set up? " +
        "Press Space to select emulators, then Enter to confirm your choices.",
      choices: choices,
    },
  ]);

  if (!selections.emulators) {
    return;
  }

  for (const selected of selections.emulators) {
    setup.config[selected] = {};
    await prompt(setup.config[selected], [
      {
        type: "input",
        name: "port",
        message: `Which port do you want to use for the ${clc.underline(selected)} emulator?`,
        default: Constants.getDefaultPort(selected as Emulators),
      },
    ]);
  }

  if (selections.emulators.length > 0) {
    await prompt(selections, [
      {
        name: "download",
        type: "confirm",
        message: "Would you like to download the emulators now?",
        default: false,
      },
    ]);
  }

  if (selections.download) {
    for (const selected of selections.emulators) {
      if (isJavaEmulator(selected)) {
        await downloadIfNecessary(selected);
      }
    }
  }
}
