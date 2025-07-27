import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import DownArrow from "../assets/downArrow.svg";
import type { UserType, SelectedClientType } from "../types";

type Props = {
  popUpRef: RefObject<HTMLElement | null>;
  clients: UserType[];
  selectedClient: SelectedClientType | null;
  setSelectedClient: (client: UserType | null) => void;
};

export default function ClientSelector({
  popUpRef,
  clients,
  selectedClient,
  setSelectedClient,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  const handleSelect = (client: UserType) => {
    setSelectedClient(client);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        popUpRef?.current &&
        popUpRef?.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative w-[300px] mx-auto my-5"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 px-4 py-2 rounded cursor-pointer bg-white flex justify-between items-center"
      >
        <span>
          {selectedClient
            ? `${selectedClient.clientName} (${selectedClient.phone})`
            : "Select a client"}
        </span>
        <span className="w-[10px] h-[5px] mr-[15px]">
          <img src={DownArrow} width="15px" height="15px" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded z-10 max-h-[200px] overflow-y-auto mt-1 p-1 box-border">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-1 outline-none"
          />
          {filteredClients.length > 0 ? (
            filteredClients.map((client, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(client)}
                className="px-3 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-50"
              >
                <p className="m-0 font-medium">{client.clientName}</p>
                <p className="m-0 text-[13px] text-gray-600">{client.phone}</p>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-gray-600">No match found</div>
          )}
        </div>
      )}
    </div>
  );
}
