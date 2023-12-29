"use client";

import {
  useDirectoryChildrenStore,
  useFileChildrenStore,
  useSelectedINodesStore,
  useRenamePopupStore,
} from "@/app/global_state/global_state";
import { useEffect } from "react";

const renameINode = async (
  rename_directory_child: (inode_id: string, new_inode_name: string) => void,
  rename_file_child: (inode_id: string, new_inode_name: string) => void
) => {
  const new_inode_name = document.getElementById("rename-input").value;
  const selected_inodes = useSelectedINodesStore.getState().selectedINodes;

  const inode = selected_inodes[0];

  if (inode.file_type == "directory") {
    rename_directory_child(inode.id, new_inode_name);
  } else {
    rename_file_child(inode.id, new_inode_name);
  }
  const data = {
    inode_id: inode.id,
    new_inode_name: new_inode_name,
  };
  await fetch("http://localhost:8000/api/renameinode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
};

const RenamePopup = () => {
  const rename_directory_child = useDirectoryChildrenStore(
    (state) => state.renameChild
  );
  const rename_file_child = useFileChildrenStore((state) => state.renameChild);
  const set_rename_active = useRenamePopupStore(
    (state) => state.setRenameActive
  );

  const handleRenameOutsideClick = (e: any) => {
    const renamePopup = document.getElementById("rename-popup");
    const rename_active = useRenamePopupStore.getState().renameActive;
    if (rename_active && !renamePopup?.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      renamePopup?.classList.add("hidden");
      set_rename_active(false);
    }
  };

  const renameINodeInvoker = async (e: any) => {
    e.preventDefault();
    renameINode(rename_directory_child, rename_file_child);
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleRenameOutsideClick);
    document
      .getElementById("rename_form")
      ?.addEventListener("submit", renameINodeInvoker);

    return () => {
      window.removeEventListener("mousedown", handleRenameOutsideClick);
      document
        .getElementById("rename_form")
        ?.removeEventListener("submit", renameINodeInvoker);
    };
  }, []);

  return (
    <div
      tabIndex={5}
      id="rename-popup"
      className="hidden border-8 border-white h-48 w-48 bg-blue-500 fixed top-1/2 left-1/2 w-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <form id="rename_form" className="text-black font-sans">
        Rename
        <input
          id="rename-input"
          type="text"
          className="text-black font-sans font-normal"
        />
        <input
          type="submit"
          value="OK"
          className="px-2 rounded-full hover:border border-black hover:bg-green-100"
          onClick={() => {
            const renamePopup = document.getElementById("rename-popup");
            renamePopup?.classList.add("hidden");
            set_rename_active(false);
          }}
        />
      </form>
    </div>
  );
};

export default RenamePopup;
