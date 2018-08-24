import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { AppCenterClient, clientRequest, models } from "../../../util/apis";
import { out, prompt } from "../../../util/interaction";
import { inspect } from "util";
import { Questions } from "../../../util/interaction/prompt";

const debug = require("debug")("appcenter-cli:commands:codepush:folder:rename");

@help("Rename CodePush folder. Does not require parameters (interactive mode).")
export default class CodePushRenameFolderCommand extends AppCommand {

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: AppCenterClient): Promise<CommandResult> {
    const app = this.app;

    const listOfFolders: models.Folder[] = await client.codePushFolders.list(app.ownerName, app.appName);
    const folder: models.Folder = await this.promptFolder(listOfFolders);
    if (!folder) {
      return success();
    }
    const newFolderName: string = await this.promptNewFolderName(folder.name);
    const newFolderPath: string = await this.promptNewFolderPath(folder.path);
    if (newFolderName === folder.name && newFolderPath === folder.path) {
      out.text(`Nether folder name nor its path has changed.`);
      return success();
    }
    try {
      debug("Renaming CodePush folder");
      await out.progress(`Renaming CodePush folder...`,
       clientRequest((cb) => client.codePushFolders.update(folder.name, app.ownerName, app.appName, newFolderName, newFolderPath, cb)));
    } catch (error) {
      debug(`Failed to rename folder - ${inspect(error)}`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `The folder ${folder.name} for app ${this.identifier} does not exist.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else if (error.statusCode = 409) {
        const alreadyExistErrorMsg = `The folder with name ${newFolderName} already exists.`;
        return failure(ErrorCodes.Exception, alreadyExistErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.response.body);
      }
    }

    let properties: string;
    if (folder.name === newFolderName) {
      properties = `${folder.name} folder path ${folder.path} to ${newFolderPath}`;
    } else {
      properties = `${folder.name} folder to ${newFolderName}`;
      if (folder.path !== newFolderPath) {
        properties += `and path ${folder.path} to ${newFolderPath}`;
      }
    }

    out.text(`Successfully renamed ${properties} for the ${this.identifier} app.`);
    return success();
  }

  private async promptFolder(listOfFolders: models.Folder[]): Promise<models.Folder> {
    if (listOfFolders.length === 0) {
      out.text(`There are no virtual folders created under the current app.`);
      return Promise.resolve(null);
    }
    const choices = listOfFolders.map((folderName) => {
      return {
        name: folderName.name,
        value: folderName.id
      };
    });

    const questions: Questions = [
      {
        type: "list",
        name: "folderId",
        message: "Pick a virtual folder to be modified",
        choices: choices
      }
    ];
    const answers: any = await prompt.question(questions);
    const chosenFolder: models.Folder[] = listOfFolders.filter((folder: models.Folder) => folder.id === answers.folderId);
    return chosenFolder.length > 0 ? chosenFolder[0] : undefined;
  }

  private async promptNewFolderName(currentName: string): Promise<string> {
    const answers: any = await prompt.question([
      {
        type: "input",
        name: "folderName",
        message: "Please enter new folder name.",
        default: currentName
      }
    ]);
    return answers.folderName;
  }

  private async promptNewFolderPath(currentPath: string): Promise<string> {
    const answers: any = await prompt.question([
      {
        type: "input",
        name: "folderPath",
        message: "Please enter new folder path.",
        default: currentPath
      }
    ]);
    return answers.folderPath;
  }
}
