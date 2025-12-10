import React from "react";
import Navbar from "../components/Navbar";
import SetupNavbar from "../components/navbars/SetupNavbar";
import VisitorAlertSettings from "../components/VisitorAlertSettings";

const Setup = () => {
  return (
    <section className="flex w-full">
      <Navbar />
      <div className="flex-1 p-2 overflow-y-auto">
        <SetupNavbar />
        <VisitorAlertSettings />
      </div>
    </section>
  );
};

export default Setup;
