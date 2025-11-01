# interaction-nets-drawing

**interaction-nets-drawing** — a tool for visualizations of [Interaction Nets](https://en.m.wikipedia.org/wiki/Interaction_nets). It has two different ways to show these nets:

* [INviz](./INviz) is a script/utility that makes static representation of nets
* [INflow](./INflow) is an interactive web application that enables real-time visualization, editing, and manipulation of nets

## Format

The library utilizes a structured JSON format for network representation. For complete schema definition and validation rules, see [`JSON Schema`](./schema-net.json).

See [the example](./example-nets/list_add) demonstrating dynamic execution of incremental list construction operations.

## License

Distributed under the [MIT License](https://choosealicense.com/licenses/mit/). See [`LICENSE`](LICENSE) for more information.
