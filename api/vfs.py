from inode_index import INodeIndex
from inode import INode

import boto3
import os

from dotenv import load_dotenv

load_dotenv()
dynamodb_table_name = os.getenv("DYNAMODB_TABLE_NAME")
s3_bucket_name = os.getenv("S3_BUCKET_NAME")

inode_metadata = {} # on mongodb
class VFS:
    def __init__(self):
        self.index = INodeIndex()
        s3 = boto3.resource("s3")
        self.s3_bucket = s3.Bucket(s3_bucket_name)
        dynamodb = boto3.resource("dynamodb")
        self.dynamodb_table = dynamodb.Table(dynamodb_table_name)
        self.populateCache()

    def populateCache(self, inode_id="0"):
        key = {
            'inode_id': inode_id
        }
        res = self.dynamodb_table.get_item(Key=key, ConsistentRead=False)
        if "Item" not in res.keys():
            # make a new root for the user
            self.InsertINode("0", "")
            return

        inode = INode(file_type=res["Item"]['file_type'],
                      name=res["Item"]['name'],
                      parent=res["Item"]['parent'],
                      id=inode_id,
                      children=res["Item"]['children'])

        self.index.Add(inode)
        children = [x for x in inode.children.split(',') if x != ""]
        for child_id in children:
            self.populateCache(child_id)

    def UploadToS3(self, data, file_id):
        self.s3_bucket.upload_fileobj(data, file_id)
    
    def PutDynamoEntry(self, inode):
        key = {
            'inode_id': {
                inode.id
            }
        }

        self.dynamodb_table.update_item(
            TableName=dynamodb_table_name,
            Key=key,
            UpdateExpression="SET #file_type = :file_type, #name = :name, #parent = :parent, #children = :children",
            ExpressionAttributeNames={
                "#file_type": "file_type",
                "#name": "name",
                "#parent": "parent",
                "#children": "children"
            },
            ExpressionAttributeValues={
                ":file_type": {
                    inode.file_type
                },
                ":name": {
                    inode.name
                },
                ":parent": {
                    inode.parent
                },
                ":children": {
                    inode.children
                }
            }
        )

    # add all the accessable inodes into a new index
    # and make it replace the old one.
    # probably the downside to this approach is that this 
    # tree traversal could take a long time
    def CleanUpIndex(self):
        global inode_index
        new_index = INodeIndex()
        def traverse(curr_id):
            children = self.index.Get(curr_id).children
            for child_id in children:
                new_index.Add(self.index.Get(child_id))
                traverse(child_id)

        traverse("0")
        del self.index
        self.index = new_index
        del new_index

    def MoveINode(self, source_inode_id, target_inode_id):
        source_inode = self.index.Get(source_inode_id)
        parent_inode = self.index.Get(source_inode.parent)

        parent_inode.RemoveChild(source_inode_id)
        target_folder = self.index.Get(target_inode_id)
        target_folder.addChild(source_inode_id)
        source_inode.parent = target_inode_id

    def DeleteINode(self, inode_id):
        del_inode = self.index.Get(inode_id)
        parent_inode = self.index.Get(del_inode.parent)
        parent_inode.RemoveChild(inode_id)
        del_inode.parent = ""

        self.PutDynamoEntry(parent_inode)
        self.PutDynamoEntry(del_inode)

    # data=None means folder
    def InsertINode(self, curr_id, filename, data=None):
        curr = self.index.Get(curr_id)
        file_type = "file" if data else "directory"

        new_inode = INode(file_type=file_type,
                           name=filename,
                           parent=curr_id)
        curr.AddChild(new_inode.id)
        self.index.Add(new_inode)

        self.PutDynamoEntry(new_inode)
        self.PutDynamoEntry(curr)

        if file_type == "file":
            self.UploadToS3(data, new_inode.id)

        return new_inode.id

vfs = VFS()
