import React from "react";
import Navbar from "../components/Navbar";
import VMSVisitors from "./VMS/VMSVisitors";

const Visitors = () => {
  return (
    <div className="visitors-page">
      <section className="flex">
        <Navbar />
        <div className="w-full flex flex-col overflow-hidden">
          <VMSVisitors />
        </div>
      </section>
    </div>
  );
};

export default Visitors;
