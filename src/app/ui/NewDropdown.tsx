"use client";

import { Menu, Transition } from "@headlessui/react";
import { FaFile, FaFolderPlus, FaPlus } from "react-icons/fa6";
import { MdDriveFolderUpload } from "react-icons/md";
import { useRef } from "react";
import {
  useCurrIdStore,
  useFileChildrenStore,
  useNewFolderPopupStore,
  useDirectoryChildrenStore,
} from "../global_state/global_state";

const NewFolderButton = () => {
  const set_new_folder_active = useNewFolderPopupStore(
    (state) => state.setNewFolderActive
  );
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className={`flex flex-row ${active && "bg-blue-500"}`}
          onClick={() => {
            const newFolderPopup = document.getElementById("new-folder-popup");
            newFolderPopup?.classList.remove("hidden");
            set_new_folder_active(true);
          }}
        >
          <FaFolderPlus className="mt-auto mb-auto mr-3" />
          New Folder
        </div>
      )}
    </Menu.Item>
  );
};

const UploadFileButton = () => {
  const fileInputRef = useRef<any>(null);
  const formSubmitRef = useRef<any>(null);
  const add_file = useFileChildrenStore((state) => state.addChild);
  const curr_id = useCurrIdStore((state) => state.currId);

  const submitFile = async () => {
    const fileInput = document.getElementById("file-input");

    const formData = new FormData();
    for (const file of fileInput.files) {
      formData.append("files", file);
    }
    formData.append("curr_id", curr_id);
    const res = await fetch("http://localhost:8000/api/uploadfile", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    const new_inodes = await res.json();

    for (const new_inode of new_inodes) {
      add_file(new_inode);
    }
  };

  return (
    <Menu.Item>
      {({ active, close }) => (
        <div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
            className={`flex flex-row ${active && "bg-blue-500"}`}
          >
            <FaFile className="mt-auto mb-auto mr-3" />
            Upload File
          </div>
          <form action={submitFile} ref={formSubmitRef}>
            <input
              id="file-input"
              multiple={true}
              ref={fileInputRef}
              type="file"
              hidden
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={() => {
                formSubmitRef.current.requestSubmit();
                close();
              }}
            />
          </form>
        </div>
      )}
    </Menu.Item>
  );
};

const UploadFolderButton = () => {
  const folderInputRef = useRef<any>(null);
  const formSubmitRef = useRef<any>(null);
  const add_directory = useDirectoryChildrenStore((state) => state.addChild);
  const curr_id = useCurrIdStore((state) => state.currId);

  const submitFile = async () => {
    const folderInput = document.getElementById("folder-input");

    const formData = new FormData();
    for (const file of folderInput.files) {
      formData.append("files", file);
      formData.append("filepaths", file.webkitRelativePath);
    }
    formData.append("curr_id", curr_id);
    const res = await fetch("http://localhost:8000/api/uploaddirectory", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    const new_directory = await res.json();

    add_directory(new_directory);
  };

  return (
    <Menu.Item>
      {({ active, close }) => (
        <div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current.click();
            }}
            className={`flex flex-row ${active && "bg-blue-500"}`}
          >
            <MdDriveFolderUpload className="mt-auto mb-auto mr-3" />
            Upload Folder
          </div>
          <form action={submitFile} ref={formSubmitRef}>
            {/* @ts-expect-error */}
            <input
              id="folder-input"
              multiple={false}
              ref={folderInputRef}
              type="file"
              hidden
              webkitdirectory=""
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={() => {
                formSubmitRef.current.requestSubmit();
                close();
              }}
            />
          </form>
        </div>
      )}
    </Menu.Item>
  );
};

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
                  <UploadFolderButton />
                </Menu.Items>
              </Transition>
            </>
          );
        }}
      </Menu>
    </div>
  );
}
