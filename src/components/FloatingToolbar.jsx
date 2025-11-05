import React from "react";
import {
  Group,
  Ungroup,
  PlusCircle,
  MinusCircle,
  Lock,
  Copy,
  Trash2,
  Unlock,
} from "lucide-react";

const FloatingToolbar = ({
  selectedElements,
  selectedElementData,
  groupElements,
  ungroupElements,
  selectedElement,
  changeZIndex,
  toggleElementLock,
  duplicateElement,
  deleteElement,
  lockedElements,
}) => {
  if (!selectedElements || selectedElements.size === 0) return null;

  return (
    <div
      className="fixed left-1/2 bottom-4 transform -translate-x-1/2 floating-toolbar"
      style={{ zIndex: 1000 }}
    >
      <button
        onClick={() => {
          if (selectedElements.size > 1) {
            groupElements();
          }
        }}
        className="toolbar-button"
        title="Group"
        disabled={selectedElements.size < 2}
      >
        <Group size={18} />
      </button>
      <button
        onClick={() => {
          if (selectedElementData?.type === "group") {
            ungroupElements(selectedElement);
          }
        }}
        className="toolbar-button"
        title="Ungroup"
        disabled={selectedElementData?.type !== "group"}
      >
        <Ungroup size={18} />
      </button>
      <button
        onClick={() => {
          Array.from(selectedElements).forEach((id) => {
            if (!lockedElements.has(id)) {
              changeZIndex(id, "forward");
            }
          });
        }}
        className="toolbar-button"
        title="Bring Forward"
      >
        <PlusCircle size={18} />
      </button>
      <button
        onClick={() => {
          Array.from(selectedElements).forEach((id) => {
            if (!lockedElements.has(id)) {
              changeZIndex(id, "backward");
            }
          });
        }}
        className="toolbar-button"
        title="Send Backward"
      >
        <MinusCircle size={18} />
      </button>
      <button
        onClick={() => {
          Array.from(selectedElements).forEach((id) => {
            if (!lockedElements.has(id)) {
              toggleElementLock(id);
            }
          });
        }}
        className="toolbar-button"
        title="Toggle Lock"
      >
        <Lock size={18} />
      </button>
      <button
        onClick={() => {
          Array.from(selectedElements).forEach((id) => {
            if (!lockedElements.has(id)) {
              duplicateElement(id);
            }
          });
        }}
        className="toolbar-button"
        title="Duplicate"
      >
        <Copy size={18} />
      </button>
      <button
        onClick={() => {
          Array.from(selectedElements).forEach((id) => {
            if (!lockedElements.has(id)) {
              deleteElement(id);
            }
          });
        }}
        className="toolbar-button text-red-500"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default FloatingToolbar;
