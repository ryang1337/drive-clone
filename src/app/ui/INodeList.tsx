'use client'

import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useEffect, } from "react"
import { FaFolder, FaFile, } from "react-icons/fa6"

import INodeModifyDropdown from "@/app/ui/INodeModifyDropdown"
import Popups from "@/app/ui/Popups/Popups"
import { INodeType } from "@/app/types"
import { useCurrIdStore, useDirectoryChildrenStore, useFileChildrenStore, useSelectedINodesStore } from "@/app/global_state/global_state"


const ChildInodeList = ({ children }: { children: Array<INodeType> }) => {
  const router = useRouter()
  const set_selected_inodes = useSelectedINodesStore((state) => state.setINodes)
  const selected_inodes = useSelectedINodesStore((state) => state.selectedINodes)

  useEffect(() => {
    set_selected_inodes([])
  }, [])

  return (
    children.map((child, i) => {
      const pathname = `/folders/${child.id}`

      const style = clsx(
        "flex flex-row justify-between p-3 hover:bg-gray-500",
        {
          "border-t": i !== 0,
          "bg-blue-500": selected_inodes.find(inode => inode.id == child.id) != null,
          "hover:!bg-blue-500": selected_inodes.find(inode => inode.id == child.id) != null
        }
      )
      return (
        <div
          key={i}
          className={style}
          onClick={() => {
            set_selected_inodes([child])
            console.log()
          }}
          onDoubleClick={() => {
            router.push(pathname)
          }}
        >
          <div className="flex flex-row space-x-4">
            {child.file_type == "directory" ?
              <FaFolder className="flex-shrink-0 mt-auto mb-auto" /> :
              <FaFile className="flex-shrink-0 mt-auto mb-auto" />
            }
            <div className="flex-shrink-0 select-none">{child.name}</div>
          </div>
          <INodeModifyDropdown />
        </div >
      )
    })
  )
}

export default function INodeList({ curr_id, directory_children, file_children }: { curr_id: string, directory_children: Array<INodeType>, file_children: Array<INodeType> }) {
  const set_directory_children = useDirectoryChildrenStore((state) => state.setChildren)
  const set_file_children = useFileChildrenStore((state) => state.setChildren)
  const set_curr_id = useCurrIdStore((state) => state.setCurrId)

  useEffect(() => {
    set_directory_children(directory_children)
    set_file_children(file_children)
    set_curr_id(curr_id)
  }, [])

  const state_directory_children = useDirectoryChildrenStore((state) => state.directoryChildren)
  const state_file_children = useFileChildrenStore((state) => state.fileChildren)

  const children = state_directory_children.concat(state_file_children)

  return (
    <div>
      <ChildInodeList children={children} />
      <Popups />
    </div>
  )
}
