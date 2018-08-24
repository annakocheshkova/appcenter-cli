import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { out } from "../../../util/interaction";
import { inspect } from "util";
import { AppCenterClient, models, clientRequest } from "../../../util/apis";
import { scriptName } from "../../../util/misc";
import * as _ from "lodash";
import * as chalk from "chalk";
const debug = require("debug")("appcenter-cli:commands:codepush:folders:add");

@help("Add a new vitual folder to an app")
export default class CodePushAddFolderCommand extends AppCommand {

  @help("New CodePush folder name")
  @required
  @name("new-folder-name")
  @position(0)
  public newFolderName: string;

  @help("New CodePush folder path")
  @name("new-folder-path")
  @position(1)
  public newFolderPath: string;

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: AppCenterClient): Promise<CommandResult> {
    const app = this.app;
    let folder: models.Folder;
    if (!this.newFolderPath) {
      this.newFolderPath = this.newFolderName;
    }
    try {
      const httpRequest = await out.progress("Creating a new CodePush folder...", clientRequest<models.Folder>(
        (cb) => client.codePushFolders.create(app.ownerName, app.appName, this.newFolderName, this.newFolderPath, cb)));
      folder = httpRequest.result;
      out.text(`Folder with ${chalk.bold(folder.name)} has been created for ${this.identifier}`);
      return success();
    } catch (error) {
      debug(`Failed to add a new CodePush folder - ${inspect(error)}`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `The app ${this.identifier} does not exist. Please double check the name, and provide it in the form owner/appname. \nRun the command ${chalk.bold(`${scriptName} apps list`)} to see what apps you have access to.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else if (error.statusCode === 409) {
        const folderExistErrorMsg = `A folder named ${chalk.bold(this.newFolderName)} already exists.`;
        return failure(ErrorCodes.Exception, folderExistErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.response.body);
      }
    }
  }
}
