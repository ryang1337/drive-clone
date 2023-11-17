'use client'

import { Menu, Transition } from "@headlessui/react"
import { FaPlus } from "react-icons/fa6"
import { useState, useEffect, useRef } from "react"


const NewFolderPopup = () => {
  return (
    <div tabIndex={5} id="new-folder-popup" className="hidden border-8 border-white h-48 w-48 bg-blue-500 fixed top-1/2 left-1/2 w-1/2 transform -translate-x-1/2 -translate-y-1/2">
      hello
    </div>
  )
}

const NewFolderButton = ({ setIsPopupActive }: { setIsPopupActive: (b: boolean) => void }) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className={`${active && 'bg-blue-500'}`}
          onClick={() => {
            const newFolderPopup = document.getElementById("new-folder-popup")
            newFolderPopup?.classList.remove("hidden")
            setIsPopupActive(true)
          }}
        >
          New Folder
        </div>
      )}
    </Menu.Item>
  )
}

const UploadFileButton = () => {
  const fileInputRef = useRef<any>(null);
  const formSubmitRef = useRef<any>(null);

  const submitFile = async () => {
    const fileInput = document.getElementById("file-input")

    const formData = new FormData()
    formData.append("file", fileInput.files[0])
    formData.append("curr_id", "0")
    const res = await fetch("http://localhost:8000/api/uploadfile", {
      method: 'POST',
      body: formData
    })
    const new_inode = await res.json()
    console.log(new_inode)
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
  const [isPopupActive, _setIsPopupActive] = useState(false);
  const popupRef = useRef(isPopupActive)
  const setIsPopupActive = (data: boolean) => {
    popupRef.current = data;
    _setIsPopupActive(data);
  }


  const handleOutsideClick = (e: any) => {
    const newFolderPopup = document.getElementById("new-folder-popup")
    if (popupRef.current && !newFolderPopup?.contains(e.target)) {
      newFolderPopup?.classList.add("hidden")
      setIsPopupActive(false)
    }
  }

  useEffect(() => {
    window.addEventListener("mousedown", handleOutsideClick)

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick)
    }

  }, [])

  return (
    <div>
      <Menu>
        {({ open }) => {
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
                  <NewFolderButton setIsPopupActive={setIsPopupActive} />
                  <UploadFileButton />
                </Menu.Items>
              </Transition>
            </>
          )
        }
        }
      </Menu >
      <NewFolderPopup />
    </div>
  )
}
