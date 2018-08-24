import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { AppCenterClient, clientRequest } from "../../../util/apis";
import { out, prompt } from "../../../util/interaction";
import { inspect } from "util";

const debug = require("debug")("appcenter-cli:commands:codepush:folder:remove");

@help("Remove CodePush folder")
export default class CodePushRemoveFolderCommand extends AppCommand {

  @help("Specifies CodePush folder name to be removed")
  @name("folder-name")
  @position(0)
  @required
  public folderName: string;

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: AppCenterClient): Promise<CommandResult> {
    const app = this.app;

    if (!await prompt.confirm(`Do you really want to remove folder ${this.folderName}?`)) {
      out.text(`Removing of folder ${this.folderName} was cancelled`);
      return success();
    }

    try {
      debug("Removing CodePush folder");
      await out.progress(`Removing CodePush folder...`,
        clientRequest((cb) => client.codePushFolders.deleteMethod(this.folderName, app.ownerName, app.appName, cb)));
    } catch (error) {
      debug(`Failed to remove CodePush folder - ${inspect(error)}`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `Folder ${this.folderName} for the ${this.identifier} app does not exist.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.response.body);
      }
    }

    out.text(`Successfully removed the ${this.folderName} folder for the ${this.identifier} app.`);
    return success();
  }
}
