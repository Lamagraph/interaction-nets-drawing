from dataclasses import dataclass
from typing import Set


@dataclass
class Port:
    id: str
    label: str | None = None
    is_used: bool = False

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        if isinstance(other, Agent):
            return self.id == other.id
        return False

    def __repr__(self):
        return self.id


@dataclass
class Agent:
    id: str
    label: str
    auxiliary_ports: Set[Port]
    principal_port: Port

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        if isinstance(other, Agent):
            return self.id == other.id
        return False

    def __repr__(self):
        return self.id


@dataclass
class Edge:
    id: str | None
    source: str
    target: str
    source_port: str
    target_port: str
    active_pair: bool | None = False
