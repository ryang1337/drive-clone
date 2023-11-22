import INodeList from "@/app/ui/INodeList"
import NewDropdown from "@/app/ui/NewDropdown"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { FaLeftLong, } from "react-icons/fa6"

const BackButton = ({ parent_inode_id }: { parent_inode_id: string }) => {
  return (
    <Link
      href={`http://localhost:3000/folders/${parent_inode_id}`}>
      <FaLeftLong className="w-8 h-8" />
    </Link>
  )
}

export default async function Home({ params }: { params: { inode_id: string } }) {
  const data = await fetch(`http://localhost:8000/api/directories/${params.inode_id}`, { cache: 'no-store' })
  const folder_content = await data.json()

  const parent_inode_id = folder_content.parent_inode_id
  const directory_children = folder_content.directory_children
  const file_children = folder_content.file_children

  return (
    <div>
      <BackButton parent_inode_id={parent_inode_id} />
      <NewDropdown />
      <INodeList curr_id={params.inode_id} directory_children={directory_children} file_children={file_children} />
    </div>
  )
}
