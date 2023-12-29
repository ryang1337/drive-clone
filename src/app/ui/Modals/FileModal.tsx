"use client";

import PdfFile from "./PdfFile";
import { FaXmark } from "react-icons/fa6";

const FileContent = ({
  file_type,
  inode_id,
}: {
  file_type: string;
  inode_id: string;
}) => {
  if (file_type == "pdf") {
    return <PdfFile inode_id={inode_id} />;
  }
  return null;
};

const FileModal = ({
  is_open,
  inode_id,
  file_name,
  set_is_open,
}: {
  is_open: boolean;
  inode_id: string;
  file_name: string;
  set_is_open: (is_open: boolean) => void;
}) => {
  if (!is_open || inode_id == "") return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-80 z-10"></div>
      <div className="z-20 w-full inset-0 flex flex-col items-center justify-center overflow-auto">
        <div className="flex flex-row w-full items-center justify-between">
          <div>{file_name}</div>
          <button
            className="text-grey-500 p-2"
            onClick={() => {
              set_is_open(false);
            }}
          >
            <FaXmark />
          </button>
        </div>
        <div className="overflow-scroll">
          <FileContent file_type="pdf" inode_id={inode_id} />
        </div>
      </div>
    </div>
  );
};

export default FileModal;
