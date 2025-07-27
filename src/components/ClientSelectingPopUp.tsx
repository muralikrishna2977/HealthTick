import { useRef, useState } from "react";
import type { FormEvent } from "react";
import ClientSelector from "./ClientSelector";
import type { UserType, CallType, SelectedClientType } from "../types";

type Props = {
  clients: UserType[];
  selectedClient: SelectedClientType | null;
  setSelectedClient: (client: UserType | null) => void;
  callType: CallType | "";
  setCallType: (type: CallType | "") => void;
  setShowModal: (value: boolean) => void;
  setWarning: (value: string) => void;
};

export default function ClientSelectingPopUp({
  clients,
  selectedClient,
  setSelectedClient,
  callType,
  setCallType,
  setShowModal,
  setWarning,
}: Props) {
  const [error, setError] = useState<string>("");
  const popUpRef = useRef<HTMLFormElement | null>(null);

  function handleCancel() {
    setCallType("");
    setSelectedClient(null);
    setShowModal(false);
    setError("");
    setWarning("");
  }

  function handleSubmitSlot(e: FormEvent) {
    e.preventDefault();

    if (!selectedClient || !callType) {
      setError("Please select both client and call type.");
      return;
    }

    setError("");
    console.log("Booking:", selectedClient, callType);
    setShowModal(false);
    setWarning("");
  }

  return (
    <form ref={popUpRef} onSubmit={handleSubmitSlot}>
      <label className="block font-semibold mt-4 mb-2 text-sm">
        Select Client <span className="text-red-500">*</span>
      </label>

      <ClientSelector
        popUpRef={popUpRef}
        clients={clients}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />

      <label className="block font-semibold mt-4 mb-2 text-sm">
        Call Type <span className="text-red-500">*</span>
      </label>

      <div className="flex flex-col gap-3 mt-2">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            value="onboarding"
            checked={callType === "onboarding"}
            onChange={() => setCallType("onboarding")}
          />
          Onboarding Call (40 minutes)
        </label>

        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            value="followup"
            checked={callType === "followup"}
            onChange={() => setCallType("followup")}
          />
          Follow-up Call (20 minutes)
        </label>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-[#f6f8fa] border border-gray-300 rounded text-sm hover:bg-[#e2e8f0] transition"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#4e9af1] text-white text-sm rounded hover:bg-[#367edb] transition"
        >
          Select Slot
        </button>
      </div>
    </form>
  );
}
