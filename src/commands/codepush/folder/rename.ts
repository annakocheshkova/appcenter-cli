import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { AppCenterClient, clientRequest } from "../../../util/apis";
import { out } from "../../../util/interaction";
import { inspect } from "util";

const debug = require("debug")("appcenter-cli:commands:codepush:folder:rename");

@help("Rename CodePush folder")
export default class CodePushRenameFolderCommand extends AppCommand {

  @help("Specifies CodePush folder name to be renamed")
  @name("current-folder-name")
  @position(0)
  @required
  public currentFolderName: string;

  @help("Specifies new CodePush folder name")
  @name("new-folder-name")
  @position(1)
  @required
  public newFolderName: string;

  @help("Specifies new CodePush folder path")
  @name("new-folder-path")
  @position(2)
  @required
  public newFolderPath: string;

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: AppCenterClient): Promise<CommandResult> {
    const app = this.app;

    try {
      debug("Renaming CodePush folder");
      await out.progress(`Renaming CodePush folder...`,
        clientRequest((cb) => client.codePushFolders.update(this.currentFolderName, app.ownerName, app.appName, this.newFolderName, this.newFolderPath, cb)));
    } catch (error) {
      debug(`Failed to rename folder - ${inspect(error)}`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `The folder ${this.currentFolderName} for app ${this.identifier} does not exist.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else if (error.statusCode = 409) {
        const alreadyExistErrorMsg = `The folder with name ${this.newFolderName} already exist.`;
        return failure(ErrorCodes.Exception, alreadyExistErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.response.body);
      }
    }

    out.text(`Successfully renamed the ${this.currentFolderName} folder to ${this.newFolderName} for the ${this.identifier} app.`);
    return success();
  }
}
