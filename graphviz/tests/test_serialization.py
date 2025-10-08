from pathlib import Path
import src.serialization as ser

PATH_GRAPHS = Path(__file__).parent / "sources"


def test_get_json_empty():
    json = ser.get_json(PATH_GRAPHS / "empty.json")
    assert json == {}


def test_get_json_invalid():
    json = ser.get_json(PATH_GRAPHS / "invalid.json")
    assert not json


def test_get_json_valid():
    json = ser.get_json(PATH_GRAPHS / "two_agents_one_edge.json")
    assert json == {
        "nodes": [
            {
                "id": "N1",
                "label": "2",
                "auxiliaryPorts": [],
                "principalPort": {"id": "P0", "label": None},
            },
            {
                "id": "N2",
                "label": "Cons",
                "auxiliaryPorts": [{"id": "P1", "label": None}],
                "principalPort": {"id": "P0", "label": None},
            },
        ],
        "edges": [
            {
                "id": "E_N1:P0-N2:P1",
                "source": "N1",
                "target": "N2",
                "sourcePort": "P0",
                "targetPort": "P1",
                "activePair": False,
            }
        ],
    }


def test_gen_net_two_agents_one_edge():
    name_net = "two_agents_one_edge"
    json = ser.get_json(PATH_GRAPHS / f"{name_net}.json")
    str_net = ser.gen_str_net(name_net, json)

    assert (
        str_net
        == """graph two_agents_one_edge {
    node [shape=rect, style="filled, rounded", fillcolor=lightblue, margin=0, width=0.5, height=0.25];
    edge [arrowtail=dot, arrowhead=dot, arrowsize=0.4];

    N1 [
        label=<
<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">
  <TR><TD BORDER="0" COLSPAN="2">2</TD></TR>
  <TR><TD BORDER="0" COLSPAN="2" PORT="P0"></TD></TR>
</TABLE>>
    ];

    N2 [
        label=<
<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">
  <TR>
    <TD BORDER="0" PORT="P1"></TD>
  </TR>
  <TR><TD BORDER="0" COLSPAN="2">Cons</TD></TR>
  <TR><TD BORDER="0" COLSPAN="2" PORT="P0"></TD></TR>
</TABLE>>
    ];

    N1:P0:s -- N2:P1:n [dir=back];

    _N_for_free_port_P0 [style=invis];
    { rank=same; N2; _N_for_free_port_P0 };
    N2:P0:s -- _N_for_free_port_P0 [dir=back];
}
"""
    )
