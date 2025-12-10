import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Site {
  site_name: string;
  id?: string | number;
  [key: string]: unknown;
}

interface RoasterDropdownProps {
  AllSites: Site[];
  selectedValue: Site | null;
  onSelect: (site: Site) => void;
}

export const RoasterDropdown: React.FC<RoasterDropdownProps> = ({
  AllSites,
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSites: Site[] = [
    { site_name: "Select All Sites" },
    ...AllSites.filter(
      (site) =>
        site &&
        site.site_name.toLowerCase().includes(searchText.toLowerCase())
    ),
  ];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="my-1 bg-white border border-gray-400 rounded-lg shadow-lg"
      style={{
        position: "absolute",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      <input
        type="text"
        placeholder="Search by text..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2 border-b border-gray-300 rounded-t-lg focus:outline-none"
        autoComplete="off"
      />
      <div className="h-60 overflow-y-auto">
        {filteredSites.length === 0 ? (
          <div className="p-2 text-gray-500">No options found</div>
        ) : (
          filteredSites.map((site, index) => (
            <div
              key={index}
              onClick={() => {
                onSelect(site);
                setIsOpen(false);
                setSearchText("");
              }}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {site.site_name}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-w-[100px] max-w-md">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="bg-white w-full border border-gray-400 rounded-lg p-2 text-left"
      >
        {selectedValue?.site_name || "Select All Sites"}
      </button>
      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default RoasterDropdown;
