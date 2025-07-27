export type CallType = "onboarding" | "followup";

export type BookingType = {
  date: string;
  time: string;
  recurring: boolean;
  clientName: string;
  phone: string;
  callType: CallType;
  id: string;
};

export type UserType = {
  clientName: string;
  phone: string;
  id:string;
}

export type SelectedClientType={
  clientName: string;
  phone: string;
}