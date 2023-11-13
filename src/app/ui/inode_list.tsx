import React from "react"
import clsx from "clsx"
import { INodeType } from "../types"

interface INodeListProps {
  folder_content: {
    directory_children: Array<INodeType>,
    file_children: Array<INodeType>,
  }
}

const INodeList: React.FC<INodeListProps> = async ({ folder_content }) => {
  const directory_children = folder_content.directory_children
  const file_children = folder_content.file_children

  const CreateChildList = (children: Array<INodeType>, file_type: string) => {
    return (
      children.map((child, i) => {
        return (
          <div
            key={i}
            className={clsx(
              "flex flex-row px-4",
              {
                "border-t": i !== 0
              }
            )}
          >
            {child.name}
          </div >
        )
      })
    )
  }

  return (
    <div>
      {CreateChildList(directory_children, "directory")}
      {CreateChildList(file_children, "file")}
    </div>
  )
}

export default INodeList
