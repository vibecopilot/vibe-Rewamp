// dateUtils.ts
export function SendDueDateFormat(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

export function ShowFormatedDueDateOnDateField(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }

  const dateTimeString = dateString.split("+")[0];
  const targetDate = new Date(dateTimeString);
  const formattedDate = targetDate.toLocaleString();

  return formattedDate;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${period}`;
}

export function FormattedDateToShowProperly(inputDateTime: string): string {
  const date = new Date(inputDateTime);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
}

export const dateFormat = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export function SendDateFormat(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function convertToIST(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  };
  const istDate = date.toLocaleString("en-IN", options);
  return istDate;
}

export const dateTimeFormat = (dateString: string | undefined): string => {
  if (!dateString) {
    return " ";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return " ";
  }

  return date.toLocaleString();
};

export const formatTime = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) {
    return "";
  }
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    return "";
  }
  let hours = date.getHours();
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const convertTo12HourFormat = (time: string | undefined): string => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const hourInt = parseInt(hour, 10);
  const period = hourInt >= 12 ? "PM" : "AM";
  const formattedHour = hourInt % 12 || 12;
  return `${formattedHour}:${minute} ${period}`;
};

export const convertTo12HrFormat = (timeStr: string | undefined): string => {
  if (typeof timeStr !== "string" || timeStr.trim() === "" || timeStr === "__") {
    return "No Data";
  }

  const parts = timeStr.split(":");
  if (parts.length < 2) return "No Data";

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

export const formatShiftTime = (shiftStartTime: string, shiftEndTime: string): string => {
  return `${convertTo12HrFormat(shiftStartTime)} - ${convertTo12HrFormat(shiftEndTime)}`;
};

export const dateFormatSTD = (dateString: string): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};
