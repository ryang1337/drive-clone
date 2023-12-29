import Link from "next/link";
import { FaLeftLong } from "react-icons/fa6";

const BackButton = ({ parent_inode_id }: { parent_inode_id: string }) => {
  return (
    <Link href={`http://localhost:3000/folders/${parent_inode_id}`}>
      <FaLeftLong className="w-8 h-8" />
    </Link>
  );
};

export default BackButton;
