from pydantic import BaseModel

class INodeIndex(BaseModel):
    index: dict = dict()

    def Add(self, inode):
        self.index[inode.id] = inode;

    def Remove(self, inode_id):
        self.index.pop(inode_id)

    def Get(self, inode_id):
        return self.index[inode_id]
