import clsx from "clsx"
import { INodeType } from "@/app/types"
import { FaFolder, FaFile } from "react-icons/fa6"
import Link from 'next/link'
import DeleteButton from "@/app/ui/delete_button"

const onDelete = async (children: Array<INodeType>, inode_id: string, file_type: string) => {
  await fetch(`http://localhost:8000/api/deleteinode/{inode_id}`)
  children = children.filter((child) => {
    return child.id !== inode_id
  })
}

const CreateChildList = (children: Array<INodeType>, file_type: string) => {
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
          {file_type == "directory" ?
            <FaFolder className="flex-shrink-0 mt-auto mb-auto" /> :
            <FaFile className="flex-shrink-0 mt-auto mb-auto" />
          }
          <div className="flex-shrink-0">{child.name}</div>
          <DeleteButton onDelete={() => onDelete(children, child.id, file_type)} />
        </Link >
      )
    })
  )
}


export default async function Home({ params }: { params: { inode_id: string } }) {
  const data = await fetch(`http://localhost:8000/api/directories/${params.inode_id}`, { cache: 'no-store' })
  const folder_content = await data.json()
  console.log("----------------------")
  console.log(folder_content)
  const directory_children = folder_content.directory_children
  const file_children = folder_content.file_children

  return (
    <div>
      {CreateChildList(directory_children, "directory")}
      {CreateChildList(file_children, "file")}
    </div>
  )
}
