import { FaTrash } from "react-icons/fa6"

export default function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <FaTrash className="flex-shrink-0 mt-automb-auto" onClick={onDelete} />
  )
}
