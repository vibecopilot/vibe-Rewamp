import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { IoAddCircleOutline, IoFilterOutline } from "react-icons/io5";
import { BsEye, BsFilterLeft } from "react-icons/bs";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";

import { BiEdit, BiFilter, BiFilterAlt } from "react-icons/bi";
import { getVendors } from "../api";
import Table from "../components/table/Table";
import { useSelector } from "react-redux";
// import jsPDF from "jspdf";
// import QRCode from "qrcode.react";

const Suppliers = () => {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const themeColor = useSelector((state) => state.theme.color);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const vendorResponse = await getVendors();
        const sortedVendor = vendorResponse.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setFilteredData(sortedVendor);
        setSuppliers(sortedVendor);
        console.log(vendorResponse);
      } catch (error) {
        console.log(error);
      }
    };
    fetchVendor();
  }, []);

  const column = [
    {
      name: "Action",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <Link to={`/suppliers/supplier-details/${row.id}`}>
            <BsEye size={15} />
          </Link>
          <Link to={`/suppliers/edit-supplier/${row.id}`}>
            <BiEdit size={15} />
          </Link>
        </div>
      ),
    },
    // { name: "ID", selector: (row) => row.id, sortable: true },
    {
      name: "Vendor Name",
      selector: (row) => row.vendor_name,
      sortable: true,
    },
    {
      name: "Company Name",
      selector: (row) => row.company_name,
      sortable: true,
    },
    {
      name: "Mobile Number",
      selector: (row) => row.mobile,
      sortable: true,
    },
    // {
    //   name: "Supplier Type",
    //   selector: (row) => row.vtype,
    //   sortable: true,
    // },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "GSTIN Number",
      selector: (row) => row.gstin_number,
      sortable: true,
    },
    { name: "PAN Number", selector: (row) => row.pan_number, sortable: true },

    // {
    //   name: "PO Outstandings",
    //   selector: (row) => row.group,
    //   sortable: true,
    // },
    // {
    //   name: "WO Outstandings",
    //   selector: (row) => row.UOM,
    //   sortable: true,
    // },
    // {
    //   name: "Ratings",
    //   selector: (row) => row.site,
    //   sortable: true,
    // },
    // {
    //   name: "Signed On Contract",
    //   selector: (row) => row.floor,
    //   sortable: true,
    // },
    {
      name: "Status",
      selector: (row) =>
        row.active ? (
          <p className="bg-green-400 px-4 w-fit text-white rounded-full">
            Active
          </p>
        ) : (
          <p className="bg-red-400 px-4 w-fit text-white rounded-full">
            Inactive
          </p>
        ),
      sortable: true,
    },
  ];

  const handleSearch = (event) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === "") {
      setFilteredData(suppliers);
    } else {
      const filteredResults = suppliers.filter(
        (item) =>
          item.vendor_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.company_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.mobile.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filteredResults);
    }
  };

  const customStyle = {
    headCells: {
      style: {
        backgroundColor: "black",
        color: "white",
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        fontSize: "11px",
      },
    },
  };

  const exportToExcel = () => {
    const mappedData = filteredData.map((supplier) => ({
    "Company Name": supplier.company_name,
    "Vendor Name": supplier.vendor_name,
    "Primary Phone": supplier.mobile,
    "Secondary Phone": supplier.secondary_mobile,
    "Primary Email": supplier.email,
    "Secondary Email": supplier.secondary_email,
    
    "PAN": supplier.pan_number,
    "Website" : supplier.website_url,
    "GST Number" : supplier.gstin_number,
    "Status": supplier.active? "Active" :"Inactive",
    "Address" : (supplier.address, supplier.address2),
    "District": supplier.district,
    "City": supplier.city,
    "State": supplier.state,
    "Pin code": supplier.pincode,
    "Country": supplier.country,
    "Bank Account Name": supplier.account_name,
    "Bank Account Number": supplier.account_number,
    "Bank & Branch": supplier.bank_branch_name,
    "IFSC": supplier.ifsc_code,
    }))
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileName = "supplier_data.xlsx";
    const ws = XLSX.utils.json_to_sheet(mappedData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  document.title = `Supplier - Vibe Connect`;

  return (
    <section className="flex  ">
      <Navbar />
      <div className="w-full mx-3 mb-5 flex  flex-col overflow-hidden">
        <div className="flex flex-wrap justify-between items-center my-5 ">
          <input
            type="text"
            placeholder="Search By Company name"
            className="border-2 p-2 w-96 border-gray-300 rounded-lg"
            value={searchText}
            onChange={handleSearch}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              to={"/suppliers/add-supplier"}
              style={{ background: themeColor }}
              className=" rounded-lg flex font-semibold  items-center gap-2 text-white p-2 "
            >
              <IoAddCircleOutline size={20} />
              Add
            </Link>
            <button
              style={{ background: themeColor }}
              className=" text-white font-bold py-2 px-4 rounded"
              onClick={exportToExcel}
            >
              Export
            </button>
            {/* <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDownloadQRCode}
            disabled={selectedRows.length === 0}
          >
            Download QR Code
          </button> */}
          </div>
        </div>
        <Table columns={column} data={filteredData} isPagination={true} />
      </div>
    </section>
  );
};

export default Suppliers;
