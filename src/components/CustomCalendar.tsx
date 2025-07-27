import axios from "axios";
import {
  format,
  addMinutes,
  setHours,
  setMinutes
} from "date-fns";
import type { BookingType, CallType, SelectedClientType } from "../types";
import React from "react";

const startHour = 10;
const startMinute = 30;
const endHour = 19;
const endMinute = 10;
const slotDuration = 20;

const generateTimeSlots = (): Date[] => {
  let slots: Date[] = [];
  let current = setMinutes(setHours(new Date(), startHour), startMinute);
  const end = setMinutes(setHours(new Date(), endHour), endMinute);

  while (current <= end) {
    slots.push(new Date(current));
    current = addMinutes(current, slotDuration);
  }
  return slots;
};

const slots = generateTimeSlots();

type CustomCalendarProps = {
  currentDate: Date;
  selectedClient: SelectedClientType | null;
  callType: CallType | "";
  bookings: BookingType[];
  warning: string;
  setWarning: React.Dispatch<React.SetStateAction<string>>;
  setSelectedClient: React.Dispatch<React.SetStateAction<SelectedClientType | null>>;
  setCallType: React.Dispatch<React.SetStateAction<CallType | "">>;
  handleGetBookings: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CustomCalendar({
  currentDate,
  selectedClient,
  callType,
  bookings,
  warning,
  setWarning,
  setSelectedClient,
  setCallType,
  handleGetBookings,
  setLoading
}: CustomCalendarProps) {
  const clientName = selectedClient?.clientName || "";
  const phone = selectedClient?.phone || "";

  async function handleAddBooking(booking: Omit<BookingType, "id">) {
    setLoading(true);
    try {
      const response = await axios.post("https://railwayserverhealthtick-production.up.railway.app/api/addBooking", booking);
      if (response.status === 200) {
        handleGetBookings();
        setTimeout(() => {
          alert("Booking added successfully!");
        }, 500);
      }
    } catch (error) {
      console.error("Error adding booking:", error);
      setLoading(false);
      alert("An error occurred while adding booking.");
    }
  }

  const handleSlotClick = (slotTime: Date) => {
    if (isBooked(slotTime)) return;

    if (!selectedClient) {
      setWarning("Please Select the Client");
      return;
    }
    setWarning("");
    const slotStr = format(slotTime, "HH:mm");
    const dayStr = format(currentDate, "yyyy-MM-dd");

    if (
      callType === "followup" &&
      bookings.some(b => b.callType === "followup" && b.phone === phone)
    ) {
      setWarning(`"${clientName}" already has a followup slot.`);
      setSelectedClient(null);
      setCallType("");
      return;
    }

    if (
      callType === "onboarding" &&
      bookings.some(b => b.callType === "onboarding" && b.phone === phone)
    ) {
      setWarning(`"${clientName}" already has an onboarding slot.`);
      setSelectedClient(null);
      setCallType("");
      return;
    }

    if (callType === "onboarding") {
      const secondSlot = addMinutes(slotTime, 20);
      const conflict = [slotTime, secondSlot].some(s => isBooked(s));
      if (conflict) {
        setWarning("Cannot book onboarding. Slot overlaps with another booking.");
        return;
      }

      const newBooking: Omit<BookingType, "id"> = {
        date: dayStr,
        time: slotStr,
        recurring: false,
        clientName,
        phone,
        callType
      };
      handleAddBooking(newBooking);
    } else if (callType === "followup") {
      const newBooking: Omit<BookingType, "id"> = {
        date: dayStr,
        time: slotStr,
        recurring: true,
        clientName,
        phone,
        callType
      };
      handleAddBooking(newBooking);
    }

    setSelectedClient(null);
    setCallType("");
  };

  async function handleDeleteBooking(id: string) {
    setLoading(true);
    try {
      const response = await axios.delete(`https://railwayserverhealthtick-production.up.railway.app/api/deleteBookings/${id}`);
      if (response.status === 200) {
        handleGetBookings();
        setTimeout(() => {
          alert("Booking deleted successfully!");
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setLoading(false);
      alert("An error occurred while deleting booking.");
    }
  }

  const deleteBooking = (bookingId?: string) => {
    if (!bookingId) return;
    const bookingExist = bookings.find(booking => booking.id === bookingId);
    if (!bookingExist) return;
    handleDeleteBooking(bookingId);
  };

  const isBooked = (slotTime: Date): boolean => !!findBooking(slotTime);

  const findBooking = (slotTime: Date): BookingType | undefined => {
    const slotStr = format(slotTime, "HH:mm");
    const dayStr = format(currentDate, "yyyy-MM-dd");

    return bookings.find(b => {
      const isSameDay = b.date === dayStr;
      const isSameTime = b.time === slotStr;

      const isSameWeekday =
        format(new Date(dayStr), "EEEE") === format(new Date(b.date), "EEEE");

      const isRecurringMatch =
        b.recurring && isSameWeekday && b.time === slotStr;

      const isOnboardingSecondSlot =
        b.callType === "onboarding" &&
        isSameDay &&
        format(addMinutes(new Date(`${b.date}T${b.time}`), 20), "HH:mm") === slotStr;

      return (
        (isSameDay && isSameTime) || isRecurringMatch || isOnboardingSecondSlot
      );
    });
  };

  const shouldRenderDelete = (booking: BookingType, slotTime: Date): boolean => {
    if (booking.callType === "onboarding") {
      const slotStr = format(slotTime, "HH:mm");
      return slotStr === booking.time;
    }
    return true;
  };

  return (
    <div className="p-5">
      {warning && (
        <div className="text-red-600 mt-2 font-medium">{warning}</div>
      )}

      <div className="space-y-1 mt-2">
        {selectedClient && (
          <>
            <div><strong>Client:</strong> {clientName}</div>
            <div><strong>Phone:</strong> {phone}</div>
          </>
        )}
        {callType && (
          <div><strong>Call Type:</strong> {callType}</div>
        )}
      </div>

      <div className="p-2 mt-5 space-y-1">
        {slots.map((slotTime, i) => {
          const booked = isBooked(slotTime);
          const booking = findBooking(slotTime);
          const bookingClientName = booking?.clientName;
          const bookingPhoneNumber = booking?.phone;
          const bookingCallType = booking?.callType;

          return (
            <div
              key={i}
              onClick={() => handleSlotClick(slotTime)}
              className={`flex justify-between items-center px-4 py-2 border-b cursor-pointer relative ${
                booked
                  ? bookingCallType === "onboarding"
                    ? "bg-[#44eaa0]"
                    : "bg-[#71aef4]"
                  : "bg-white"
              }`}
            >
              <span>
                {format(slotTime, "hh:mm a")} - {format(addMinutes(slotTime, 20), "hh:mm a")}
              </span>

              {booked && booking && shouldRenderDelete(booking, slotTime) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {`${bookingCallType === "onboarding" ? "Onboarding" : "Follow Up"} slot Booked for: ${bookingClientName} (${bookingPhoneNumber})`}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteBooking(booking.id);
                    }}
                    className="bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
