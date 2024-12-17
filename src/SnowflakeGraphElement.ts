import { parseSnowflakeID } from "./Config";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import * as SnowflakeGraphs from "./SnowflakeGraph";
import { SnowflakeGraph } from "./SnowflakeGraph";
import { NonEmptyArray, ok } from "./Utils";

export default class SnowflakeGraphElement extends HTMLElement {
    #shadow: ShadowRoot;
    #snowflakeID: NonEmptyArray<number>;
    #graph: Maybe<SnowflakeGraph>;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#snowflakeID = [4,4];
        this.#graph = none();
    }

    connectedCallback() {
        const g = SnowflakeGraphs.zero()
        this.#graph = some(g);
        this.#shadow.appendChild(g.root);
    }

    disconnectedCallback() {
        console.log('sfg disconnectedCallback');

    }

    adoptedCallback() {
        console.log('sfg adoptedCallback');
    }

    setSnowflakeID(unparsedID: string): void {
        this.#snowflakeID = Maybes.expect(ok(parseSnowflakeID(unparsedID)), 'invalid snowflake id');
        Maybes.mapSome(this.#graph, g => SnowflakeGraphs.syncToSnowflakeID(g, this.#snowflakeID));
    }
}