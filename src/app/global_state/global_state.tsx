import { create } from "zustand";
import { INodeType } from "../types";

interface CurrIdState {
  currId: string
  setCurrId: (new_id: string) => void
}

const useCurrIdStore = create<CurrIdState>((set) => ({
  currId: "0",
  setCurrId: (new_id) => set(() => ({ currId: new_id }))
}))

interface DirectoryChildrenState {
  directoryChildren: Array<INodeType>
  removeChild: (child_id: string) => void
  addChild: (child: INodeType) => void
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
  }))
}))

interface FileChildrenState {
  fileChildren: Array<INodeType>
  removeChild: (child_id: string) => void
  addChild: (child: INodeType) => void
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
  }))
}))

export { useCurrIdStore }
export { useDirectoryChildrenStore }
export { useFileChildrenStore }
