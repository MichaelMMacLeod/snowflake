import { Controller } from "./Controller";
import * as Controllers from "./Controller";

export function main(): Controller {
    return Controllers.make();
}
