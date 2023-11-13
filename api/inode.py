from pydantic import BaseModel
from uuid import uuid4

class INode(BaseModel):
    id: str = str(uuid4())
    file_type: str
    name: str
    parent: str
    children: str = ""

    def AddChild(self, child_id):
        if(self.children == ""):
            self.children = child_id
        else:
            self.children = self.children + "," + child_id

    def RemoveChild(self, child_id):
        self.children = self.children.replace(child_id, "")
        self.children = "" if self.children == "," else self.children
