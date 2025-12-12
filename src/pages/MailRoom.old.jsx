import React, { useState } from "react";
import Navbar from "../components/Navbar";
import DeliveryVendor from "./SubPages/DeliveryVendor";
import Inbound from "./SubPages/Inbound";
import OutBound from "./SubPages/OutBound";


const MailRoom = () => {
  const [page, setPage] = useState("deliveryVendor");
  return (
    <section className="flex">
      <Navbar />
      <div className=" w-full flex mx-3 my-2 flex-col overflow-hidden">
        <div className="flex justify-center">
          <div className="flex flex-row gap-10  font-semibold p-2 text-sm rounded-full bg-gray-400">
            <h2
              className={`p-1 ${
                page === "deliveryVendor" && "bg-white text-blue-500"
              } rounded-full px-4 cursor-pointer`}
              onClick={() => setPage("deliveryVendor")}
            >
              Delivery Vendor
            </h2>
            <h2
              className={`p-1 ${
                page === "inBound" && "bg-white text-blue-500"
              } rounded-full px-4 cursor-pointer`}
              onClick={() => setPage("inBound")}
            >
              Inbound
            </h2>
            <h2
              className={`p-1 ${
                page === "outBound" && "bg-white text-blue-500"
              } rounded-full px-4 cursor-pointer`}
              onClick={() => setPage("outBound")}
            >
              Outbound
            </h2>
           
          </div>
        </div>
        {page === "deliveryVendor" && (
          <div>
           <DeliveryVendor/>
          </div>
        )}
        {page === "inBound" && (
          <div>
           <Inbound/>
          </div>
        )}
        {page === "outBound" && (
          <div>
           <OutBound/>
          </div>
        )}
       
      </div>
    </section>
  );
};

export default MailRoom;
