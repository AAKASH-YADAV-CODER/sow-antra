import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Group,
  Ungroup,
  Lock,
  Unlock,
  Copy,
  Trash2,
  MessageCircle,
  MoreHorizontal,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Link,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Clipboard,
  Paintbrush
} from "lucide-react";

/**
 * FloatingToolbar Component
 * Canva-style contextual toolbar that follows the selection.
 */
const FloatingToolbar = ({
  selectedElements,
  pages,
  currentPage,
  groupElements,
  ungroupElements,

  toggleElementLock,
  duplicateElement,
  deleteElement,
  lockedElements,
  zoomLevel,
  canvasOffset,
  canvasRef,
  canvasSize,
  onCommentClick,
  alignElements,
  changeZIndex,
  copyElements,
  copyStyle,
  pasteElements,
  pasteStyle,
  hasClipboard,
  hasStyleClipboard
}) => {
  const [position, setPosition] = useState({ left: 0, top: 0, opacity: 0 });
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // 'align' or 'layer'
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, align: 'right' }); // Portal position

  const moreMenuBtnRef = useRef(null);

  // Get current page elements
  const currentElements = useMemo(() => {
    const page = pages.find((p) => p.id === currentPage);
    return page ? page.elements : [];
  }, [pages, currentPage]);

  // Find the selected element data
  const selectedElementsData = useMemo(() => {
    return currentElements.filter((el) => selectedElements.has(el.id));
  }, [currentElements, selectedElements]);

  // Calculate bounding box and position
  useEffect(() => {
    // If no selection, hide everything (including portal menu)
    if (selectedElementsData.length === 0 || !canvasRef.current || !canvasSize) {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
      setIsMoreMenuOpen(false); // Force close menu on deselection
      return;
    }

    const updatePosition = () => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      selectedElementsData.forEach(el => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRect.width / canvasSize.width;
      const scaleY = canvasRect.height / canvasSize.height;

      const selectionCenterX = (minX + maxX) / 2;
      const selectionTopY = minY;

      const screenX = canvasRect.left + (selectionCenterX * scaleX);
      const screenY = canvasRect.top + (selectionTopY * scaleY);

      const toolbarHeight = 50;
      const padding = 20;
      let finalTop = screenY - toolbarHeight - 15;

      // Keep inside vertical bounds
      if (finalTop < padding) {
        finalTop = canvasRect.top + (maxY * scaleY) + 15;
      }

      setPosition({
        left: screenX,
        top: Math.max(padding, finalTop),
        opacity: 1
      });
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 0);
    return () => clearTimeout(timer);
  }, [selectedElementsData, zoomLevel, canvasOffset, canvasRef, canvasSize]);

  // Handle Menu Position (Portal)
  useEffect(() => {
    if (isMoreMenuOpen && moreMenuBtnRef.current) {
      const rect = moreMenuBtnRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const menuWidth = 240; // Approx menu width

      let left = rect.right + 10;
      let align = 'left'; // Expanding towards right by default

      // Check if fits on right
      if (left + menuWidth > screenWidth) {
        left = rect.left - menuWidth - 10;
        align = 'right';
      }

      const top = rect.top + (rect.height / 2);

      setMenuPosition({
        top: top,
        left: align === 'left' ? rect.right + 10 : rect.left - 10,
        align: align
      });
    }
  }, [isMoreMenuOpen, position]);


  // Execute action safely
  const handleAction = useCallback((action) => {
    if (typeof action === 'function') {
      try {
        action();
      } catch (err) {
        console.error("Action error:", err);
      }
    }
    // Delay closing to ensure action executes and visual feedback is seen
    setTimeout(() => {
      setIsMoreMenuOpen(false);
      setActiveSubMenu(null);
    }, 100);
  }, []);

  const handleSubMenuToggle = useCallback((subMenu, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setActiveSubMenu(prev => prev === subMenu ? null : subMenu);
  }, []);

  if (selectedElements.size === 0) return null;

  const isLocked = Array.from(selectedElements).every(id => lockedElements.has(id));
  const hasGroup = selectedElementsData.some(el => el.type === 'group');
  const isMultiSelect = selectedElements.size > 1;

  const MenuItem = ({ icon: Icon, label, onClick, hasSubMenu, active }) => (
    <button
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors rounded-md my-0.5 ${active ? 'bg-purple-50 text-purple-600 font-medium' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={active ? 'text-purple-500' : 'text-gray-500'} />
        <span>{label}</span>
      </div>
      {hasSubMenu && <ChevronRight size={14} className={active ? 'text-purple-400' : 'text-gray-400'} />}
    </button>
  );

  return (
    <>
      {/* MAIN TOOLBAR */}
      <div
        className="fixed transform -translate-x-1/2 flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-gray-100 p-1.5 gap-1 transition-all duration-200"
        style={{
          zIndex: 5000,
          left: position.left,
          top: position.top,
          opacity: position.opacity,
          pointerEvents: position.opacity === 0 ? 'none' : 'auto',
        }}
        onMouseDown={(e) => { e.stopPropagation(); }}
        onClick={(e) => { e.stopPropagation(); }}
      >
        {/* Buttons... */}
        {/* Buttons... */}

        {/* Comment */}
        <button
          onClick={(e) => handleAction(() => onCommentClick && onCommentClick(), e)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          title="Comment"
        >
          <MessageCircle size={18} />
        </button>

        {/* Lock/Unlock */}
        <button
          onClick={(e) => handleAction(() => Array.from(selectedElements).forEach(id => toggleElementLock(id)), e)}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isLocked ? 'text-gray-900 bg-gray-100' : 'text-gray-700'}`}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
        </button>

        {/* Duplicate */}
        {!isLocked && (
          <button
            onClick={(e) => handleAction(() => Array.from(selectedElements).forEach(id => duplicateElement(id)), e)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            title="Duplicate"
          >
            <Copy size={18} />
          </button>
        )}

        {/* Delete */}
        {!isLocked && (
          <button
            onClick={(e) => handleAction(() => Array.from(selectedElements).forEach(id => deleteElement(id)), e)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        )}

        {/* Group/Ungroup - Only visible for multi-select/groups */}
        {(isMultiSelect || hasGroup) && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-0.5" />
            {isMultiSelect && (
              <button
                onClick={(e) => handleAction(groupElements, e)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                title="Group"
              >
                <Group size={18} />
              </button>
            )}
            {hasGroup && (
              <button
                onClick={(e) => handleAction(() => {
                  const groupToUngroup = selectedElementsData.find(el => el.type === 'group');
                  if (groupToUngroup) ungroupElements(groupToUngroup.id);
                }, e)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                title="Ungroup"
              >
                <Ungroup size={18} />
              </button>
            )}
          </>
        )}

        {/* More Button */}
        <button
          ref={moreMenuBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsMoreMenuOpen((prev) => !prev);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${isMoreMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
          title="More"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* PORTAL FOR MORE MENU */}
      {isMoreMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Backdrop clicked");
              setIsMoreMenuOpen(false);
              setActiveSubMenu(null);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Keep this? Yes, prevent canvas interaction behind.
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Menu */}
          <div
            className="absolute w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 py-1 px-1 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: menuPosition.top,
              left: menuPosition.align === 'left' ? menuPosition.left : undefined,
              right: menuPosition.align === 'right' ? (window.innerWidth - menuPosition.left) : undefined,
              transform: 'translateY(-50%)'
            }}
            // CRITICAL: Stop propagation here to prevent "Backdrop" click or Canvas click
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <MenuItem icon={Copy} label="Copy" onClick={() => handleAction(copyElements)} />
            {!isMultiSelect && <MenuItem icon={Paintbrush} label="Copy Style" onClick={() => handleAction(copyStyle)} />}
            {hasClipboard && <MenuItem icon={Clipboard} label="Paste" onClick={() => handleAction(pasteElements)} />}
            <MenuItem icon={Copy} label="Duplicate" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => duplicateElement(id)))} />
            <MenuItem icon={Trash2} label="Delete" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => deleteElement(id)))} />
            <MenuItem icon={isLocked ? Unlock : Lock} label={isLocked ? "Unlock" : "Lock"} onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => toggleElementLock(id)))} />

            <div className="h-px bg-gray-100 my-1 mx-2" />

            {/* Align Menu */}
            <div className="relative w-full">
              <MenuItem
                icon={AlignLeft}
                label={isMultiSelect ? "Align selection" : "Align to page"}
                hasSubMenu
                active={activeSubMenu === 'align'}
                onClick={(e) => handleSubMenuToggle('align', e)}
              />
              {activeSubMenu === 'align' && (
                <div
                  className={`absolute top-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 px-1 animate-in fade-in zoom-in-95 duration-200 ${menuPosition.align === 'left' ? 'left-full ml-1' : 'right-full mr-1'
                    }`}
                  style={{ zIndex: 100 }}
                >
                  <MenuItem icon={AlignLeft} label="Left" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'left'))} />
                  <MenuItem icon={AlignCenter} label="Center" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'center'))} />
                  <MenuItem icon={AlignRight} label="Right" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'right'))} />
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <MenuItem icon={AlignStartVertical} label="Top" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'top'))} />
                  <MenuItem icon={AlignCenterVertical} label="Middle" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'middle'))} />
                  <MenuItem icon={AlignEndVertical} label="Bottom" onClick={() => handleAction(() => alignElements(Array.from(selectedElements), 'bottom'))} />
                </div>
              )}
            </div>

            {/* Layer Menu */}
            <div className="relative w-full">
              <MenuItem
                icon={Layers}
                label="Layer"
                hasSubMenu
                active={activeSubMenu === 'layer'}
                onClick={(e) => handleSubMenuToggle('layer', e)}
              />
              {activeSubMenu === 'layer' && (
                <div
                  className={`absolute top-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 px-1 animate-in fade-in zoom-in-95 duration-200 ${menuPosition.align === 'left' ? 'left-full ml-1' : 'right-full mr-1'
                    }`}
                  style={{ zIndex: 100 }}
                >
                  <MenuItem icon={ArrowUp} label="Bring Forward" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => changeZIndex(id, 'forward')))} />
                  <MenuItem icon={ChevronsUp} label="Bring to Front" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => changeZIndex(id, 'front')))} />
                  <MenuItem icon={ArrowDown} label="Send Backward" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => changeZIndex(id, 'backward')))} />
                  <MenuItem icon={ChevronsDown} label="Send to Back" onClick={() => handleAction(() => Array.from(selectedElements).forEach(id => changeZIndex(id, 'back')))} />
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <MenuItem icon={Layers} label="Show Layers" onClick={() => handleAction(() => { })} />
                </div>
              )}
            </div>

            <div className="h-px bg-gray-100 my-2 mx-2" />

            <MenuItem icon={Link} label="Link" onClick={() => handleAction(() => { })} />
            <MenuItem icon={MessageCircle} label="Comment" onClick={() => handleAction(onCommentClick)} />
          </div>
        </div>,
        document.body
      )}
    </>

  );
};

export default FloatingToolbar;
