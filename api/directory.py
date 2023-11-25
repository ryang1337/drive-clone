from __future__ import annotations
from typing import Dict, List
from pydantic import BaseModel

class Directory(BaseModel):
    name: str
    files: List[int] = []
    directories: Dict[str, Directory] = dict()
