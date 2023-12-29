"use client";

import { Menu, Transition } from "@headlessui/react";
import { FaEllipsisVertical, FaPenToSquare, FaTrash } from "react-icons/fa6";
import {
  useRenamePopupStore,
  useSelectedINodesStore,
  useDirectoryChildrenStore,
  useFileChildrenStore,
} from "../global_state/global_state";
import { INodeType } from "../types";
import { usePopper } from "../utils/UsePopper";

const RenameButton = () => {
  const set_rename_active = useRenamePopupStore(
    (state) => state.setRenameActive
  );
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className={`flex flex-row ${active && "bg-blue-500"}`}
          onClick={() => {
            const renamePopup = document.getElementById("rename-popup");
            renamePopup?.classList.remove("hidden");
            set_rename_active(true);
          }}
        >
          <FaPenToSquare className="mt-auto mb-auto mr-3" />
          Rename
        </div>
      )}
    </Menu.Item>
  );
};

const onDelete = async (
  remove_directory_child: (child_id: string) => void,
  remove_file_child: (child_id: string) => void,
  selected_inodes: Array<INodeType>
) => {
  const inode = selected_inodes[0];
  const file_type = inode.file_type;
  const inode_id = inode.id;

  await fetch(`http://localhost:8000/api/deleteinode/${inode_id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (file_type == "directory") {
    remove_directory_child(inode_id);
  } else {
    remove_file_child(inode_id);
  }
};

const DeleteButton = () => {
  const remove_directory_child = useDirectoryChildrenStore(
    (state) => state.removeChild
  );
  const remove_file_child = useFileChildrenStore((state) => state.removeChild);
  const selected_inodes = useSelectedINodesStore(
    (state) => state.selectedINodes
  );

  return (
    <Menu.Item>
      {({ active, close }) => (
        <div
          className={`flex flex-row ${active && "bg-blue-500"}`}
          onClick={async (e) => {
            e.preventDefault();
            await onDelete(
              remove_directory_child,
              remove_file_child,
              selected_inodes
            );
            close();
          }}
        >
          <FaTrash className="flex-shrink-0 mt-auto mb-auto mr-3" />
          Delete
        </div>
      )}
    </Menu.Item>
  );
};

export default function INodeModifyDropdown() {
  let [trigger, container] = usePopper({
    placement: "bottom-start",
    strategy: "fixed",
    modifiers: [{ name: "offset", options: { offset: [-90, 10] } }],
  });

  return (
    <div>
      <Menu>
        {({ open }) => {
          return (
            <>
              <Menu.Button ref={trigger}>
                <FaEllipsisVertical className="mt-auto mb-auto" />
              </Menu.Button>

              <div ref={container}>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="z-10 fixed bg-green-500 cursor-pointer">
                    <RenameButton />
                    <DeleteButton />
                  </Menu.Items>
                </Transition>
              </div>
            </>
          );
        }}
      </Menu>
    </div>
  );
}
