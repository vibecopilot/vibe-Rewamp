import React, { useEffect, useState } from "react";

interface RemainingTimeProps {
  dueDate: string | null;
  title?: string;
}

const RemainingTime: React.FC<RemainingTimeProps> = ({ dueDate, title }) => {
  const [remainingTime, setRemainingTime] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (dueDate === null) {
      return () => {};
    }
    
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      const dateTimeString = dueDate.split("+")[0];
      const targetDate = new Date(dateTimeString);
      const timeDifference = currentDate.getTime() - targetDate.getTime();

      if (timeDifference > 0) {
        setIsOverdue(true);

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        let overdueTimeString = "";

        if (days > 0) {
          if (hours === 0) {
            overdueTimeString += `${days} d ago`;
          } else {
            overdueTimeString += `${days} d, ${hours} h ago`;
          }
        } else if (days === 0 && hours > 0) {
          if (minutes === 0) {
            overdueTimeString += `${hours} h ago`;
          } else {
            overdueTimeString += `${hours} h, ${minutes} m ago`;
          }
        } else if (days === 0 && hours === 0 && minutes > 0) {
          overdueTimeString += `${minutes} m ago`;
        } else {
          overdueTimeString += `${seconds} s ago`;
        }

        setRemainingTime(overdueTimeString);
      } else {
        setIsOverdue(false);

        const days = Math.floor(Math.abs(timeDifference) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((Math.abs(timeDifference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((Math.abs(timeDifference) % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((Math.abs(timeDifference) % (1000 * 60)) / 1000);

        let timeString = "";

        if (days > 0) {
          timeString += `${days} d,  `;
        }
        if (hours > 0 || days > 0) {
          timeString += `${hours} h, `;
        }
        if (minutes > 0 || hours > 0 || days > 0) {
          timeString += `${minutes} m`;
          if (minutes <= 1) {
            timeString += `, ${seconds} s`;
          }
        }

        if (timeString === "") {
          timeString += `${seconds} s`;
        }

        timeString += " left";

        setRemainingTime(timeString);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dueDate]);

  return (
    <div style={{ color: isOverdue ? "#ff6363" : "#40d240" }}>
      {remainingTime}
    </div>
  );
};

export default RemainingTime;
