import { useState, useEffect } from "react";
import CustomCalendar from "./CustomCalendar.js";
import ClientSelectingPopUp from "./ClientSelectingPopUp.js";
import { format, addDays } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "./Modal.js";
import RightArrow from "../assets/rightArrow.svg";
import LeftArrow from "../assets/leftArrow.svg";
import axios from "axios";
import type { BookingType, UserType, CallType, SelectedClientType } from "../types";
import "./Calender.css";
import { BounceLoader } from 'react-spinners';

function MainPage() {
  const [clients, setClients] = useState<UserType[]>([]);
  const [selectedClient, setSelectedClient] = useState<SelectedClientType | null>(null);
  const [callType, setCallType] = useState<CallType | "">("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading]=useState<boolean>(false);

  const handleGetUsers = async () => {
    try {
      const response = await axios.get<UserType[]>("https://railwayserverhealthtick-production.up.railway.app/api/getUsers");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleGetBookings = async () => {
    try {
      const response = await axios.get<BookingType[]>("https://railwayserverhealthtick-production.up.railway.app/api/getBookings");
      if (response.status === 200) {
        setBookings(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetUsers();
    handleGetBookings();
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <div className="flex flex-col items-center w-1/5 h-full bg-[#d5e6ff]">
        <button
          className="inline-flex items-center gap-2 py-[15px] px-[25px] rounded-[12px] bg-[#3a8ff0] text-white text-lg font-medium shadow transition-colors mt-[100px]"
          onClick={() => setShowModal(true)}
        >
          Select Client
        </button>

        {showModal && (
          <Modal>
            <ClientSelectingPopUp
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              callType={callType}
              setCallType={setCallType}
              setShowModal={setShowModal}
              setWarning={setWarning}
            />
          </Modal>
        )}

        
        <Calendar
            onChange={(value) => {
                if (value instanceof Date) {
                    setCurrentDate(value);
                }
            }}
            value={currentDate}
        />

      </div>

      <div className="w-4/5 h-full flex flex-col bg-[#d5e6ff]">
        <div className="flex justify-between items-center h-[70px] w-full bg-[#d5e6ff]">
          <button
            className="m-5 h-10 bg-[#f4f4f4] text-[#333] border border-[#ccc] rounded-md px-3 text-lg font-bold hover:bg-[#e2e8f0] transition"
            onClick={() => setCurrentDate(addDays(currentDate, -1))}
          >
            <img src={LeftArrow} width="20px" height="20px" />
          </button>

          {loading && (
            <div >
              <BounceLoader color="#6FA5DB" />
            </div>
          )}
          <h3 className="text-center text-lg font-semibold">{format(currentDate, "EEEE, d MMMM yyyy")}</h3>

          <button
            className="m-5 h-10 bg-[#f4f4f4] text-[#333] border border-[#ccc] rounded-md px-3 text-lg font-bold hover:bg-[#e2e8f0] transition"
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
          >
            <img src={RightArrow} width="20px" height="20px" />
          </button>
        </div>

        <div className="flex-1 w-[calc(100%-20px)] m-0 mr-5 mb-5 bg-white rounded-[30px] border border-black overflow-hidden flex flex-col">
          <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <CustomCalendar
              currentDate={currentDate}
              selectedClient={selectedClient}
              callType={callType}
              bookings={bookings}
              warning={warning}
              setWarning={setWarning}
              setSelectedClient={setSelectedClient}
              setCallType={setCallType}
              handleGetBookings={handleGetBookings}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
