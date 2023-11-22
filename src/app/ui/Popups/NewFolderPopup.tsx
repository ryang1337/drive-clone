import { useCurrIdStore, useDirectoryChildrenStore, useNewFolderPopupStore } from "@/app/global_state/global_state"
import { INodeType } from "@/app/types"
import { useEffect } from "react"

const createNewFolder = async (add_directory_child: (inode: INodeType) => void) => {
  const new_folder_name = document.getElementById("new-folder-input").value
  const curr_inode_id = useCurrIdStore.getState().currId

  const data = {
    "target_inode_id": curr_inode_id,
    "created_inode_name": new_folder_name
  }

  const response = await fetch("http://localhost:8000/api/createdirectory", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: 'no-store'
  })

  const new_folder = await response.json()
  add_directory_child(new_folder)
}

const NewFolderPopup = () => {
  const set_new_folder_active = useNewFolderPopupStore((state) => state.setNewFolderActive)
  const add_directory_child = useDirectoryChildrenStore((state) => state.addChild)

  const handleOutsideClick = (e: any) => {
    const newFolderPopup = document.getElementById("new-folder-popup")
    const new_folder_active = useNewFolderPopupStore.getState().newFolderActive
    if (new_folder_active && !newFolderPopup?.contains(e.target)) {
      e.preventDefault()
      e.stopPropagation()
      newFolderPopup?.classList.add("hidden")
      set_new_folder_active(false)
    }
  }

  const createNewFolderInvoker = async (e: any) => {
    e.preventDefault()
    createNewFolder(add_directory_child)
  }

  useEffect(() => {
    window.addEventListener("mousedown", handleOutsideClick)
    document.getElementById("new-folder-form")?.addEventListener("submit", createNewFolderInvoker)

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick)
      document.getElementById("new-folder-form")?.removeEventListener("submit", createNewFolderInvoker)
    }

  }, [])

  return (
    <div tabIndex={5} id="new-folder-popup" className="hidden border-8 border-white h-48 w-48 bg-blue-500 fixed top-1/2 left-1/2 w-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <form id="new-folder-form" className="text-black font-sans">
        New Folder
        <input id="new-folder-input" type="text" className="text-black font-sans font-normal" />
        <input type="submit" value="OK" className="px-2 rounded-full hover:border border-black hover:bg-green-100" onClick={() => {
          const newFolderPopup = document.getElementById("new-folder-popup")
          newFolderPopup?.classList.add("hidden")
          set_new_folder_active(false)
        }} />
      </form>
    </div>
  )
}

export default NewFolderPopup

