from pydantic import BaseModel

class INodeCreationObject(BaseModel):
    target_inode_id: str
    created_inode_name: str

class INodeMoveObject(BaseModel):
    source_inode_id: str
    target_inode_id: str

class INodeDeletionObject(BaseModel):
    target_inode_id: str

class INodeRenameObject(BaseModel):
    inode_id: str
    new_inode_name: str
