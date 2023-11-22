import { create } from "zustand";
import { INodeType } from "../types";

// CURR ID STATE
interface CurrIdState {
  currId: string
  setCurrId: (new_id: string) => void
}

const useCurrIdStore = create<CurrIdState>((set) => ({
  currId: "0",
  setCurrId: (new_id) => set(() => ({ currId: new_id }))
}))


// DIRECTORY CHILDREN STATE
interface DirectoryChildrenState {
  directoryChildren: Array<INodeType>
  removeChild: (child_id: string) => void
  addChild: (inode: INodeType) => void
  renameChild: (child_id: string, new_inode_name: string) => void
  setChildren: (children: Array<INodeType>) => void
}

const useDirectoryChildrenStore = create<DirectoryChildrenState>((set) => ({
  directoryChildren: [],
  removeChild: (child_id) => set((state) => ({
    directoryChildren: state.directoryChildren.filter((child) => {
      return child.id !== child_id
    })
  })),
  addChild: (inode) => set((state) => ({
    directoryChildren: state.directoryChildren.concat([inode])
  })),
  renameChild: (child_id, new_inode_name) => set((state) => ({
    directoryChildren: state.directoryChildren.map((inode) => {
      if (inode.id == child_id) {
        inode.name = new_inode_name
      }
      return inode
    })
  })),
  setChildren: (children) => set(() => ({
    directoryChildren: children
  }))
}))


// FILE CHILDREN STATE
interface FileChildrenState {
  fileChildren: Array<INodeType>
  removeChild: (child_id: string) => void
  addChild: (inode: INodeType) => void
  renameChild: (child_id: string, new_inode_name: string) => void
  setChildren: (children: Array<INodeType>) => void
}

const useFileChildrenStore = create<FileChildrenState>((set) => ({
  fileChildren: [],
  removeChild: (child_id) => set((state) => ({
    fileChildren: state.fileChildren.filter((child) => {
      return child.id !== child_id
    })
  })),
  addChild: (inode) => set((state) => ({
    fileChildren: state.fileChildren.concat([inode])
  })),
  renameChild: (child_id, new_inode_name) => set((state) => ({
    fileChildren: state.fileChildren.map((inode) => {
      if (inode.id == child_id) {
        inode.name = new_inode_name
      }
      return inode
    })
  })),
  setChildren: (children) => set(() => ({
    fileChildren: children
  }))
}))


// NEW FOLDER POPUP STATE
interface NewFolderPopupState {
  newFolderActive: boolean
  setNewFolderActive: (active: boolean) => void
}

const useNewFolderPopupStore = create<NewFolderPopupState>((set) => ({
  newFolderActive: false,
  setNewFolderActive: (active) => set(() => ({
    newFolderActive: active
  }))
}))


// RENAME POPUP STATE
interface RenamePopupState {
  renameActive: boolean
  setRenameActive: (active: boolean) => void
}

const useRenamePopupStore = create<RenamePopupState>((set) => ({
  renameActive: false,
  setRenameActive: (active) => set(() => ({
    renameActive: active
  }))
}))


// SELECTED INODES STATE
interface SelectedINodesState {
  selectedINodes: Array<INodeType>
  addINode: (inode: INodeType) => void
  removeINode: (inode_id: string) => void
  setINodes: (inodes: Array<INodeType>) => void
}

const useSelectedINodesStore = create<SelectedINodesState>((set) => ({
  selectedINodes: [],
  removeINode: (inode_id) => set((state) => ({
    selectedINodes: state.selectedINodes.filter((inode) => {
      return inode_id != inode.id
    })
  })),
  addINode: (inode_id) => set((state) => ({
    selectedINodes: state.selectedINodes.concat([inode_id])
  })),
  setINodes: (inodes) => set(() => ({
    selectedINodes: inodes
  }))
}))

export { useCurrIdStore }
export { useDirectoryChildrenStore }
export { useFileChildrenStore }
export { useNewFolderPopupStore }
export { useRenamePopupStore }
export { useSelectedINodesStore }
