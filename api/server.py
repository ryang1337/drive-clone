from api_objects import INodeCreationObject, INodeMoveObject, INodeDeletionObject

from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inode import INode
from typing import Annotated
from dotenv import load_dotenv
from uuid import uuid4

import boto3
import os

app = FastAPI(
    version="1.0",
    title="REST API for drive-clone",
)

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME")
DEBUG = True

DEBUG_INDEX = {
    "0": INode(
        id="0",
        file_type="directory",
        name="",
        parent="",
        children="1,2",

    ),
    "1": INode(
        id="1",
        file_type="directory",
        name="folder1",
        parent="0",
        children="3"
    ),
    "2": INode(
        id="2",
        file_type="directory",
        name="folder2",
        parent="0",
        children=""
    ),
    "3": INode(
        id="3",
        file_type="file",
        name="file1",
        parent="1",
        children=""
    ),
    "4": INode(
        id="4",
        file_type="folder",
        name="folder3",
        parent="1",
        children=""
    )
}

s3 = boto3.resource("s3")
s3_bucket = s3.Bucket(S3_BUCKET_NAME)
dynamodb = boto3.resource("dynamodb")
dynamodb_table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# creates a new inode if id is not specified, otherwise it will update
# the dynamodb entry with the given id
def put_inode(file_type="", filename="", parent_id="", inode=None):
    if inode == None:
        inode = INode(
            file_type=file_type,
            name=filename,
            parent=parent_id,
        )

    key = { 'inode_id': inode.id }

    dynamodb_table.update_item(
        Key=key,
        UpdateExpression="SET #file_type = :file_type, #name = :name, #parent = :parent, #children = :children",
        ExpressionAttributeNames={
            "#file_type": "file_type",
            "#name": "name",
            "#parent": "parent",
            "#children": "children"
        },
        ExpressionAttributeValues={
            ":file_type": inode.file_type,
            ":name": inode.name,
            ":parent": inode.parent,
            ":children": ""
        }
    )

    return inode

def get_inode(inode_id):
    if DEBUG:
        return DEBUG_INDEX[inode_id]

    key = { "inode_id": inode_id }
    try:
        response = dynamodb_table.get_item(Key=key, ConsistentRead=False)
    except Exception as e:
        print(f"Error getting INode with id {inode_id} from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail=f"The database encountered an error.")

    if "Item" not in response.keys():
        print(f"INode with id {inode_id} does not exist in DynamoDB")
        raise HTTPException(status_code=404, detail=f"File or folder does not exist.")
    
    return INode(
        file_type=response["Item"]["file_type"],
        name=response["Item"]["name"],
        parent=response["Item"]["parent"],
        id=response["Item"]["inode_id"],
        children=response["Item"]["children"]
    )

@app.get("/api/directories/{directory_id}")
def read_directory(directory_id: str):
    try:
        directory_inode = get_inode(directory_id)
    except HTTPException:
        raise

    if directory_inode.file_type != "directory":
        raise HTTPException(status_code=404, detail="Folder does not exist.")
    
    children = [x for x in directory_inode.children.split(',') if x != '']
    directory_children = []
    file_children = []

    for child_inode_id in children:
        try:
            child_inode = get_inode(child_inode_id)
        except HTTPException:
            raise

        if child_inode.file_type == "directory":
            directory_children.append(child_inode)
        else:
            file_children.append(child_inode)

    return {
        "curr_inode_id": directory_inode.id,
        "parent_inode_id": directory_inode.parent,
        "directory_children": directory_children,
        "file_children": file_children,
    }

@app.post("/api/createdirectory")
def create_directory(obj: INodeCreationObject):
    return put_inode(
        file_type="directory",
        filename=obj.created_inode_name,
        parent_id=obj.target_inode_id
    )

@app.post("/api/uploadfile")
def upload_file(file: UploadFile, curr_id: Annotated[str, Form()]):
    if file.filename == None:
        print(f"Attempted to upload invalid file in directory {curr_id}")
        raise HTTPException(status_code=400, detail="Invalid file.")

    inode = put_inode(
        file_type="file",
        filename=file.filename,
        parent_id=curr_id)
    s3_bucket.upload_fileobj(file.file, inode.id)

# @app.post("/api/uploaddirectory")
# def upload_directory(file: UploadFile, curr_id: Annotated[str, Form()]):
#     id = vfs.InsertFile(curr_id, file.filename, file.file)
#     return inode_index[id].__dict__

@app.delete("/api/deleteinode/{inode_id}")
def delete_inode(inode_id: str):
    if DEBUG:
        inode = DEBUG_INDEX[inode_id]
        parent = DEBUG_INDEX[inode.parent]

        return

    try:
        inode = get_inode(inode_id)
    except HTTPException:
        raise
    
    try:
        parent_inode = get_inode(inode.parent)
    except HTTPException:
        raise

    inode.parent = ""
    parent_inode.RemoveChild(inode.id)

    put_inode(inode=inode)
    put_inode(inode=parent_inode)

# @app.put("/api/movefile")
# def move_folder(obj: FolderMoveObject):
#     vfs.MoveFile(obj.file_id, obj.new_folder_id)
#     return inode_index[obj.file_id]
