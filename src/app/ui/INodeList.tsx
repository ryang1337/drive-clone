'use client'

import clsx from "clsx"
import { INodeType } from "@/app/types"
import { FaFolder, FaFile, FaTrash, } from "react-icons/fa6"
import Link from 'next/link'
import { useState } from "react"

const onDelete = async (children: Array<INodeType>, inode_id: string, setChildren: (c: Array<INodeType>) => void) => {
  await fetch(`http://localhost:8000/api/deleteinode/${inode_id}`, { method: "DELETE" })
  setChildren(children.filter((child) => {
    return child.id !== inode_id
  }))
}

const CreateChildList = (children: Array<INodeType>, setChildren: (c: Array<INodeType>) => void) => {
  return (
    children.map((child, i) => {
      const pathname = `http://localhost:3000/folders/${child.id}`
      return (
        <Link
          href={pathname}
          key={i}
          className={clsx(
            "flex flex-row p-3 space-x-4",
            {
              "border-t": i !== 0
            }
          )}
        >
          {child.file_type == "directory" ?
            <FaFolder className="flex-shrink-0 mt-auto mb-auto" /> :
            <FaFile className="flex-shrink-0 mt-auto mb-auto" />
          }
          <div className="flex-shrink-0">{child.name}</div>
          <FaTrash className="flex-shrink-0 mt-auto mb-auto hover:border hover:border-white hover:rounded-xl"
            onClick={async (e: any) => {
              e.preventDefault();
              e.stopPropagation();
              await onDelete(children, child.id, setChildren)
            }} />

        </Link >
      )
    })
  )
}

export default function INodeList({ directory_children, file_children }: { directory_children: Array<INodeType>, file_children: Array<INodeType> }) {
  const inode_children = directory_children.concat(file_children)
  const [children, setChildren] = useState<Array<INodeType>>(inode_children);

  return (
    <div>
      {CreateChildList(children, setChildren)}
    </div>
  )
}
