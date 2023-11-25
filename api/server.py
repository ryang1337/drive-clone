from api_objects import INodeCreationObject, INodeMoveObject, INodeDeletionObject, INodeRenameObject, UploadFileObject

from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inode import INode
from directory import Directory
from typing import Annotated, List
from dotenv import load_dotenv

import boto3
import os

import jsonpickle
import json

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
        children="3,4"
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
        file_type="directory",
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
    if DEBUG:
        if inode == None:
            inode = INode(
                file_type=file_type,
                name=filename,
                parent=parent_id,
            )
            DEBUG_INDEX[inode.id] = inode
        else:
            if inode.id not in DEBUG_INDEX:
                DEBUG_INDEX[inode.id] = inode
            else:                
                DEBUG_INDEX[inode.id].file_type = inode.file_type
                DEBUG_INDEX[inode.id].name = inode.name
                DEBUG_INDEX[inode.id].parent = inode.parent

        return DEBUG_INDEX[inode.id]

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
            ":children": inode.children
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
    child_inode = put_inode(
        file_type="directory",
        filename=obj.created_inode_name,
        parent_id=obj.target_inode_id
    )

    parent_inode = get_inode(obj.target_inode_id)
    parent_inode.AddChild(child_inode.id)
    put_inode(inode=parent_inode)

    return child_inode

@app.post("/api/uploadfile")
def upload_file(files: List[UploadFile], curr_id: Annotated[str, Form()]):
    inodes = []
    for file in files:
        if file.filename == None:
            print(f"Attempted to upload invalid file in directory {curr_id}")
            raise HTTPException(status_code=400, detail="Invalid file.")

        inode = put_inode(
            file_type="file",
            filename=file.filename,
            parent_id=curr_id)
        inodes.append(inode)

        parent_inode = get_inode(curr_id)
        parent_inode.AddChild(inode.id)
        put_inode(inode=parent_inode)

        if not DEBUG:
            s3_bucket.upload_fileobj(file.file, inode.id)

    return inodes

@app.post("/api/uploaddirectory")
def upload_directory(files: List[UploadFile], filepaths: Annotated[List[str], Form()], curr_id: Annotated[str, Form()]):
    split_filepaths = [filepath.split('/') for filepath in filepaths]
    print(split_filepaths)
    base = Directory(name=split_filepaths[0][0])

    # create the intermediate representation of the folder strucutre
    # for easier inode creation
    for i in range(len(split_filepaths)):
        filepath = split_filepaths[i]
        curr = base
        for j in range(1, len(filepath)):
            # last element in filepath array, so must be the file itself
            if j == len(filepath) - 1:
                curr.files.append(i)
                continue

            directory_name = filepath[j]
            # if the directory already exists, set curr to be that directory
            if directory_name in curr.directories:
                curr = curr.directories[directory_name]
                continue

            # if directory doesn't exist, create it
            new_directory = Directory(name=directory_name)
            curr.directories[directory_name] = new_directory
            curr = new_directory

    serialized = jsonpickle.encode(base)
    print(json.dumps(json.loads(serialized), indent=2))

    def recursive_create(curr_directory: Directory, parent_id: str):
        inode = INode(file_type="directory", name=curr_directory.name, parent=parent_id)
        for file in curr_directory.files:
            file_inode = INode(file_type="file", name=split_filepaths[file][-1], parent=inode.id)
            inode.AddChild(file_inode.id)
            put_inode(inode=file_inode)
            if not DEBUG:
                s3_bucket.upload_fileobj(files[file], filepaths[file][-1])
            
        for directory in curr_directory.directories.values():
            inode.AddChild(recursive_create(directory, inode.id).id)

        put_inode(inode=inode)
        return inode

    new_directory_inode = recursive_create(base, curr_id)
    parent_inode = get_inode(curr_id)
    parent_inode.AddChild(new_directory_inode.id)
    return new_directory_inode

@app.post("/api/renameinode")
def rename_inode(obj: INodeRenameObject):
    if DEBUG:
        inode = DEBUG_INDEX[obj.inode_id]
        inode.name = obj.new_inode_name
        return

    try:
        inode = get_inode(obj.inode_id)
    except HTTPException:
        raise

    inode.name = obj.new_inode_name
    
    put_inode(inode=inode)

@app.delete("/api/deleteinode/{inode_id}")
def delete_inode(inode_id: str):
    if DEBUG:
        inode = DEBUG_INDEX[inode_id]
        parent = DEBUG_INDEX[inode.parent]
        DEBUG_INDEX[inode.id].parent = "";
        DEBUG_INDEX[parent.id].RemoveChild(inode.id);

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
