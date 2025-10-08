from sys import argv
from pathlib import Path

from src.serialization import create_png


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
    if len(argv) <= 1:
        print("Files not found")
        exit(1)
    files = argv[1:]
    main(files, need_save_dot=False)
    print("Check nets-png")
