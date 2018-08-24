import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { AppCenterClient, clientRequest, models } from "../../../util/apis";
import { out, prompt } from "../../../util/interaction";
import { inspect } from "util";
import { Questions } from "../../../util/interaction/prompt";

const debug = require("debug")("appcenter-cli:commands:codepush:folder:remove");

@help("Remove CodePush folder. Do not enter folder name to use interactive mode.")
export default class CodePushRemoveFolderCommand extends AppCommand {

  @help("Specifies CodePush folder name to be removed")
  @name("folder-name")
  @position(0)
  public positionedFolderName: string;

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: AppCenterClient): Promise<CommandResult> {
    const app = this.app;
    const listOfFolders: models.Folder[] = await client.codePushFolders.list(app.ownerName, app.appName);
    let folderName: string;
    if (!this.positionedFolderName) {
      folderName = await this.promptFolder(listOfFolders);
    } else {
      folderName = this.positionedFolderName;
    }
    if (!folderName) {
      return success();
    }
    if (!await prompt.confirm(`Do you really want to remove folder ${folderName}?`)) {
      out.text(`Removing of folder ${folderName} was cancelled`);
      return success();
    }

    try {
      debug("Removing CodePush folder");
       await out.progress(`Removing CodePush folder...`,
       clientRequest((cb) => client.codePushFolders.deleteMethod(folderName, app.ownerName, app.appName, cb)));
    } catch (error) {
      debug(`Failed to remove CodePush folder - ${inspect(error)}`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `Folder ${folderName} for the ${this.identifier} app does not exist.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.response.body);
      }
    }

    out.text(`Successfully removed the ${folderName} folder for the ${this.identifier} app.`);
    return success();
  }

  private async promptFolder(listOfFolders: models.Folder[]): Promise<string> {
    if (listOfFolders.length === 0) {
      out.text(`There are no virtual folders created under the current app.`);
      return Promise.resolve(null);
    }
    const choices = listOfFolders.map((folderName) => {
      return {
        name: folderName.name,
        value: folderName.name
      };
    });

    const questions: Questions = [
      {
        type: "list",
        name: "folderName",
        message: "Pick a virtual folder to be deleted",
        choices: choices
      }
    ];
    const answers: any = await prompt.question(questions);
    return answers.folderName;
  }
}
