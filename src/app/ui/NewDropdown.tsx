'use client'

import { Menu, Transition } from "@headlessui/react"
import { FaFolder, FaPlus } from "react-icons/fa6"
import { useRef } from "react"
import { useCurrIdStore, useFileChildrenStore, useNewFolderPopupStore } from "../global_state/global_state"

const NewFolderButton = () => {
  const set_new_folder_active = useNewFolderPopupStore((state) => state.setNewFolderActive)
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className={`flex flex-row ${active && 'bg-blue-500'}`}
          onClick={() => {
            const newFolderPopup = document.getElementById("new-folder-popup")
            newFolderPopup?.classList.remove("hidden")
            set_new_folder_active(true)
          }}
        >
          <FaFolder className="mt-auto mb-auto mr-3" />
          New Folder
        </div>
      )}
    </Menu.Item>
  )
}

const UploadFileButton = () => {
  const fileInputRef = useRef<any>(null);
  const formSubmitRef = useRef<any>(null);
  const add_file = useFileChildrenStore((state) => state.addChild)
  const curr_id = useCurrIdStore((state) => state.currId)

  const submitFile = async () => {
    const fileInput = document.getElementById("file-input")

    const formData = new FormData()
    formData.append("file", fileInput.files[0])
    formData.append("curr_id", curr_id)
    const res = await fetch("http://localhost:8000/api/uploadfile", {
      method: 'POST',
      body: formData,
      cache: "no-store"
    })
    const new_inode = await res.json()
    add_file(new_inode)
  }

  return (
    <Menu.Item>
      {({ active, close }) => (
        <div>
          <div
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current.click()
            }}
            className={`${active && 'bg-blue-500'}`}
          >
            Upload File
          </div>
          <form action={submitFile} ref={formSubmitRef}>
            <input id="file-input" multiple={false} ref={fileInputRef} type="file" hidden onClick={(e) => {
              e.stopPropagation()
            }}
              onChange={() => {
                formSubmitRef.current.requestSubmit()
                close()
              }} />
          </form>
        </div>
      )}
    </Menu.Item>
  )
}

export default function NewDropdown() {
  return (
    <div>
      <Menu>
        {() => {
          return (
            <>
              <Menu.Button>
                <FaPlus />
              </Menu.Button>

              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >

                <Menu.Items className="z-10 fixed bg-green-500 cursor-pointer">
                  <NewFolderButton />
                  <UploadFileButton />
                </Menu.Items>
              </Transition>
            </>
          )
        }
        }
      </Menu >
    </div>
  )
}
