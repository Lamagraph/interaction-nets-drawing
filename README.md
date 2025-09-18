# interaction-nets-drawing

**interaction-nets-drawing** — a tool for visualizations of [Interaction nets](https://en.m.wikipedia.org/wiki/Interaction_nets). It has two different ways to show these nets:

* [graphviz](./graphviz) is a script/utility that makes static representation of nets
* [react-flow](./react-flow) is an interactive web application that enables real-time visualization, editing, and manipulation of nets

## Format

The library utilizes a structured JSON format for network representation. For complete schema definition and validation rules, see [`JSON Schema`](./schema-net.json).

See [the example](./example-nets/list_add) demonstrating dynamic execution of incremental list construction operations.

## License

Distributed under the [MIT License](https://choosealicense.com/licenses/mit/). See [`LICENSE`](LICENSE) for more information.
