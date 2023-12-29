'use client'

import PdfFile from "./PdfFile";

const FileContent = ({file_type, inode_id} : {file_type: string, inode_id: string}) => {

    if(file_type == "pdf") {
        return (
            <PdfFile inode_id={inode_id}/>
        )
    }
    return null;
}

const FileModal = ({ is_open, inode_id } : {is_open: boolean, inode_id: string}) => {
    if(!is_open || inode_id == "") return null;
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
            {/* <iframe src={url} className="absolute inset-0 w-full h-full bg-white" /> */}
            <div className="fixed inset-0 bg-black opacity-80 z-10"></div>
            <div className="z-20 overflow-scroll">
                <FileContent file_type="pdf" inode_id={inode_id}/>
            </div>
        </div>
    )
}

export default FileModal;