from sys import argv
from pathlib import Path
from typing import Any, Set
import subprocess
import json

from Nets import Port, Node, Edge

ds = "  "
tab = "    "


def get_json(file: Path) -> Any:
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        print("Error: JSON syntax")


def get_type_port(node, port) -> bool:
    if node.principal_port.id == port:
        node.principal_port.is_used = True
        return True
    else:
        for p in node.auxiliary_ports:
            if p.id == port:
                p.is_used = True
                break

    return False


def gen_label_node(label: str, auxiliary_ports: Set[Port], principal_port: Port) -> str:
    lines = '<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">\n'

    if auxiliary_ports:
        lines += ds + "<TR>\n"
    for port in auxiliary_ports:
        lines += ds + ds + f'<TD BORDER="0" PORT="{port}">{port.label or ""}</TD>\n'
    if auxiliary_ports:
        lines += ds + "</TR>\n"

    if label:
        lines += ds + f'<TR><TD BORDER="0" COLSPAN="2">{label or ""}</TD></TR>\n'

    lines += (
        ds
        + f'<TR><TD BORDER="0" COLSPAN="2" PORT="{principal_port.id}">{principal_port.label  or ""}</TD></TR>\n'
    )

    return lines + "</TABLE>>\n"


def gen_str_node(node_j, nodes: Set[Node]) -> str | None:
    lines = ""

    node: Node
    try:
        data = node_j.get("data")
        if data:
            node = Node(
                id=node_j.get("id"),
                label=data.get("label"),
                auxiliary_ports={Port(**port) for port in data.get("auxiliaryPorts")},
                principal_port=Port(**data.get("principalPort")),
            )
        else:
            node = Node(
                id=node_j.get("id"),
                label=node_j.get("label"),
                auxiliary_ports={Port(**port) for port in node_j.get("auxiliaryPorts")},
                principal_port=Port(**node_j.get("principalPort")),
            )
    except:
        return None

    nodes.add(node)

    line_fst = tab + f"{node} [\n"
    line_snd = tab + tab + "label=<\n"
    lines_label = gen_label_node(node.label, node.auxiliary_ports, node.principal_port)
    line_last = tab + "];\n\n"

    lines += line_fst + line_snd + lines_label + line_last

    return lines


def gen_str_edge(edge_j, nodes: Set[Node]) -> str | None:
    line = ""

    edge: Edge
    try:
        edge = Edge(
            id=edge_j.get("id"),
            source=edge_j.get("source"),
            target=edge_j.get("target"),
            source_port=edge_j.get("sourcePort"),
            target_port=edge_j.get("targetPort"),
            active_pair=edge_j.get("activePair"),
        )
    except:
        return None

    is_south_node_s, is_south_node_t = False, False
    is_found_node_s, is_found_node_t = False, False
    for node in nodes:
        if not is_found_node_s and node.id == edge.source:
            is_south_node_s = get_type_port(node, edge.source_port)
            is_found_node_s = True

        if not is_found_node_t and node.id == edge.target:
            is_south_node_t = get_type_port(node, edge.target_port)
            is_found_node_t = True

    str_node_s = f"{edge.source}:{edge.source_port}:{'s' if is_south_node_s else 'n'}"
    str_node_t = f"{edge.target}:{edge.target_port}:{'s' if is_south_node_t else 'n'}"

    line = tab + str_node_s + " -- " + str_node_t

    if edge.active_pair:
        line += ' [constraint=false, color="blue", dir=both];\n'
    elif is_south_node_s:
        line += " [dir=back];\n"
    elif is_south_node_t:
        line += " [dir=forward];\n"
    else:
        line += ";\n"

    return line


def gen_str_edge_invis(port: Port, id_node: str, is_principal_port: bool) -> str:
    lines = ""

    if not port.is_used:
        str_id_node = f"_N_for_free_port_{port}"
        lines += tab + str_id_node + " [style=invis];\n"
        lines += tab + "{ " + f"rank=same; {id_node}; {str_id_node}" + " };\n"
        if is_principal_port:
            lines += tab + f"{id_node}:{port}:s -- {str_id_node} [dir=back];\n"
        else:
            lines += tab + f"{id_node}:{port}:n -- {str_id_node};\n"

    return lines


def gen_str_graph(name_graph: str, data_json: Any) -> str | None:
    lines = f"graph {name_graph}" + " {\n"
    lines += (
        tab
        + 'node [shape=rect, style="filled, rounded", fillcolor=lightblue, margin=0, width=0.5, height=0.25];\n'
    )
    lines += tab + "edge [arrowtail=dot, arrowhead=dot, arrowsize=0.4];\n\n"

    nodes: Set[Node] = set()
    try:
        nodes_j = data_json.get("nodes")
        for node_j in nodes_j:
            gen = gen_str_node(node_j, nodes)
            if gen:
                lines += gen
            else:
                raise
    except:
        print("Error: illegal node data")
        return None

    try:
        edges_j = data_json.get("edges")
        for edge_j in edges_j:
            gen = gen_str_edge(edge_j, nodes)
            if gen:
                lines += gen
            else:
                raise
    except:
        print("Error: illegal edge data")
        return None

    lines += "\n"

    for node in nodes:
        for port in node.auxiliary_ports:
            lines += gen_str_edge_invis(port, node.id, False)
        lines += gen_str_edge_invis(node.principal_port, node.id, True)

    return lines + "}\n"


def create_png(file: Path, need_save_dot: bool) -> None:
    name_file = file.stem
    data_json = get_json(file)
    if not data_json:
        return None

    str_dot = gen_str_graph(name_file, data_json)
    if not str_dot:
        return None

    file_png = f"./nets-png/{file.stem}.png"

    if need_save_dot:
        file_dot = f"./nets-dot/{file.stem}.dot"
        with open(file_dot, "w") as f:
            f.write(str_dot)

        subprocess.run(["dot", "-Tpng", file_dot, "-o", file_png])
    else:
        subprocess.run(["dot", "-Tpng", "-o", file_png], input=str_dot, text=True)


def main(files: list[str], need_save_dot: bool) -> None:
    paths = []

    for file in files:
        path = Path(file)
        if path.is_dir():
            paths.extend(path.rglob("*.json"))
        else:
            if path.suffix.lower() == ".json":
                paths.append(path)

    for path in paths:
        create_png(path, need_save_dot)


if __name__ == "__main__":
    files = argv[1:]
    main(files, False)
