import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, Edit3Icon, XIcon } from "lucide-react";

export default function EditableField({
  fieldName,
  fieldLabel,
  fieldValue,
  editingField,
  editValues,
  onChange,
  onSave,
  onCancel,
  onEdit,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{fieldLabel}</label>
      {editingField ? (
        <div className="flex space-x-2">
          <Input
            value={editValues[fieldName]}
            onChange={(e) => onChange({ ...editValues, [fieldName]: e.target.value })}
            className="flex-1"
          />
          <Button size="sm" onClick={() => onSave(fieldName)}>
            <CheckIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCancel(fieldName)}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          onClick={() => onEdit(fieldName, fieldValue)}
        >
          <span className="grow">{fieldValue}</span>
          <Edit3Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}
