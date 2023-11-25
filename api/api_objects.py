from pydantic import BaseModel
from fastapi import UploadFile

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

class UploadFileObject(BaseModel):
    files: list[UploadFile]
    curr_id: str
