import React, { useState, useRef, useEffect, useCallback } from "react";
import image from "/profile.png";
import { FaCheck, FaTrash } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";
import { getItemInLocalStorage } from "../../../utils/localStorage";
import toast from "react-hot-toast";
import {
  getHostList,
  getSetupUsers,
  getVisitorStaffCategory,
  postNewGoods,
  postNewVisitor,
  postVisitorInDevice,
  getExpectedMobile,
} from "../../../api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import FileInputBox from "../../../containers/Inputs/FileInputBox";
import Select from "react-select";
import Webcam from "react-webcam";
// import AxiosDigestAuth from "@mhoc/axios-digest-auth"; // Removed - package has ES module issues
const EmployeeAddVisitor = () => {
  const siteId = getItemInLocalStorage("SITEID");
  const userId = getItemInLocalStorage("UserId");
  const [behalf, setbehalf] = useState("Visitor");
  const inputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [visitors, setVisitors] = useState([{ name: "", mobile: "" }]);
  const [selectedFrequency, setSelectedFrequency] = useState("Once");
  const [selectedVisitorType, setSelectedVisitorType] = useState("Guest");
  const [passStartDate, setPassStartDate] = useState("");
  const [passEndDate, setPassEndDate] = useState("");
  const [hosts, setHosts] = useState([]);
  const [staffCategories, setStaffCategories] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({});
  const mobileNo = searchParams.get("mobileNumber");
  console.log(mobileNo);
  const [time, setTime] = useState(new Date());
  let expDate = "";
  let expTime = "";
  useEffect(() => {
    const newTime = new Date();
    setTime((prevTime) => {
      expDate = `${newTime.getDate()}-${
        newTime.getMonth() + 1
      }-${newTime.getFullYear()}`;
      console.log("Updated Date:", expDate);
      expTime = `${newTime.getHours()}:${newTime.getMinutes()}`;
      console.log("Updated Time:", expTime);

      return newTime; // Update state only if needed
    });
  }, []); //
  const getData = async (mobileNo) => {
    try {
      const response = await getExpectedMobile(mobileNo);
      console.log(response.data);
      const visitorHostUserId = response?.data?.hosts?.[0]?.user_id || "";
      setFormData({
        ...formData,
        visitorName: response.data.name,
        purpose: response.data.purpose,
        passNumber: response.data.pass_number,
        comingFrom: response.data.coming_from,
        vehicleNumber: response.data.vehicle_number,
        host: visitorHostUserId,
      });
    } catch (error) {
      console.error(error);
      toast.error("Add New number");
    }
  };

  useEffect(() => {
    getData(mobileNo);
  }, [mobileNo]);

  const [formData, setFormData] = useState({
    visitorName: "",
    mobile: mobileNo,
    purpose: "",
    comingFrom: "",
    vehicleNumber: "",
    expDate: new Date().toISOString().split("T")[0],
    expTime: new Date().toLocaleTimeString().slice(0, 5),
    hostApproval: false,
    goodsInward: false,
    host: "",
    supportCategory: "",
    passNumber: "",
    noOfGoods: "",
    goodsDescription: "",
    goodsAttachments: [],
    slotNumber: "",
  });
  const themeColor = useSelector((state) => state.theme.color);
  const handleFrequencyChange = (e) => {
    setSelectedFrequency(e.target.value);
  };
  const handleVisitorTypeChange = (e) => {
    setSelectedVisitorType(e.target.value);
  };
  const handleAddVisitor = (event) => {
    event.preventDefault();
    setVisitors([...visitors, { name: "", mobile: "" }]);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newVisitors = [...visitors];
    newVisitors[index][name] = value;
    setVisitors(newVisitors);
  };

  const handleRemoveVisitor = (index) => {
    const newVisitors = [...visitors];
    newVisitors.splice(index, 1);
    setVisitors(newVisitors);
  };

  const getHeadingText = () => {
    switch (behalf) {
      case "Visitor":
        return "NEW VISITOR";
      case "Delivery":
        return "DELIVERY & SUPPORT STAFF";
      case "Cab":
        return "CAB";
      default:
        return "CREATE VISITOR";
    }
  };

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const formatDateWithSeconds = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-indexed month
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const createNewVisitor = async () => {
    const loadingToast = toast.loading("Please wait...");
    if (formData.visitorName === "") {
      return toast.error("Provide Visitor name");
    }
    if (formData.host === "") {
      return toast.error("Provide Host name");
    }
    // if (formData.purpose === "") {
    //   return toast.error("Provide Purpose");
    // }
    if (formData.mobile === "") {
      return toast.error("Provide Visitor Mobile Number");
    }
    const mobilePattern = /^\d{10}$/;
    if (!mobilePattern.test(formData.mobile)) {
      return toast.error("Mobile number must be  10 digits.");
    }

    const postData = new FormData();
    postData.append("visitor[site_id]", siteId);
    postData.append("visitor[created_by_id]", userId);
    postData.append("visitor[name]", formData.visitorName);
    // if (capturedImage) {
    //   const response = await fetch(capturedImage);
    //   const blob = await response.blob();
    // }
    if (userType === "security_guard") {
      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = URL.createObjectURL(blob);
        const fileObject = new File([blob], "visitor_image.jpg", {
          type: blob.type,
        });
        postData.append("visitor[profile_picture]", fileObject);
      }
    } else {
      if (imageFile) {
        postData.append("visitor[profile_picture]", imageFile, "visitor_image");
      }
    }
    postData.append("visitor[contact_no]", formData.mobile);
    postData.append("visitor[purpose]", formData.purpose);
    postData.append(
      "visitor[vhost_id]",
      userType === "security_guard" ? formData.host : userId
    );
    postData.append("visitor[start_pass]", passStartDate);
    postData.append("visitor[end_pass]", passEndDate);
    postData.append("visitor[coming_from]", formData.comingFrom);
    postData.append("visitor[vehicle_number]", formData.vehicleNumber);
    postData.append("visitor[expected_date]", formData.expDate);
    postData.append("visitor[expected_time]", formData.expTime);
    postData.append("visitor[skip_host_approval]", formData.hostApproval);
    postData.append("visitor[goods_inwards]", formData.goodsInward);
    postData.append("visitor[visit_type]", selectedVisitorType);
    postData.append("visitor[frequency]", selectedFrequency);
    selectedWeekdays.forEach((day) => {
      postData.append("visitor[working_days][]", day);
    });
    visitors.forEach((extraVisitor, index) => {
      postData.append(
        `visitor[extra_visitors_attributes][${index}][name]`,
        extraVisitor.name
      );
      postData.append(
        `visitor[extra_visitors_attributes][${index}][contact_no]`,
        extraVisitor.mobile
      );
    });
    try {
      const visitResp = await postNewVisitor(postData);
      const dataToSave = {
        UserInfo: {
          employeeNo: visitResp.data.id,
          name: formData.visitorName,
          userType: "visitor",
          Valid: {
            enable: true,
            beginTime: passStartDate,
            endTime: passEndDate,
          },
        },
      };
      console.log("making json file");
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `visitor_data_${visitResp.data.id}.json`;
      a.click();
      console.log("json file created successfully");
      const postGoods = new FormData();
      formData.goodsAttachments.forEach((docs) => {
        postGoods.append("goods_files[]", docs);
      });
      postGoods.append("goods_in_out[visitor_id]", visitResp.data.id);
      postGoods.append("goods_in_out[no_of_goods]", formData.noOfGoods);
      postGoods.append("goods_in_out[description]", formData.goodsDescription);
      postGoods.append("goods_in_out[ward_type]", "in");
      postGoods.append("goods_in_out[vehicle_no]", formData.vehicleNumber);
      postGoods.append("goods_in_out[person_name]", formData.visitorName);
      postGoods.append("goods_in_out[created_by_id]", userId);
      try {
        const goodsRes = await postNewGoods(postGoods);
        console.log(goodsRes);
      } catch (error) {
        console.log(error);
      }
      // try {
      //   const payload = {
      //     UserInfo: {
      //       // employeeNo: "08035",
      //       employeeNo: visitResp.data.id.toString(),
      //       name: formData.visitorName,
      //       userType: "visitor",
      //       Valid: {
      //         enable: true,
      //         // beginTime: "2024-12-27T17:30:08",
      //         beginTime: formatDateWithSeconds(passStartDate),
      //         endTime: formatDateWithSeconds(passEndDate),
      //         // endTime: "2024-12-29T18:30:08",
      //       },
      //     },
      //   };
      //   const deviceRes = await postVisitorInDevice(payload);
      //   console.log(deviceRes);
      // } catch (error) {
      //   console.log(error);
      // }
      toast.dismiss(loadingToast);
      navigate("/employee/passes/visitors");
      toast.success("Visitor Added Successfully");
    } catch (error) {
      console.log(error);
      toast.dismiss(loadingToast);
    }
  };

  const currentDates = new Date();
  const year = currentDates.getFullYear();
  const month = String(currentDates.getMonth() + 1).padStart(2, "0");
  const day = String(currentDates.getDate()).padStart(2, "0");
  const todayDate = `${year}-${month}-${day}`;
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [weekdaysMap, setWeekdaysMap] = useState([
    { day: "Mon", index: 0, isActive: false },
    { day: "Tue", index: 1, isActive: false },
    { day: "Wed", index: 2, isActive: false },
    { day: "Thu", index: 3, isActive: false },
    { day: "Fri", index: 4, isActive: false },
    { day: "Sat", index: 5, isActive: false },
    { day: "Sun", index: 6, isActive: false },
  ]);
  console.log(selectedWeekdays);

  const handleWeekdaySelection = (weekday) => {
    console.log(`Selected day: ${weekday}`);

    const index = weekdaysMap.find((dayObj) => dayObj.day === weekday)?.index;

    if (index !== undefined) {
      const updatedWeekdaysMap = weekdaysMap.map((dayObj) =>
        dayObj.index === index
          ? { ...dayObj, isActive: !dayObj.isActive }
          : dayObj
      );
      setWeekdaysMap(updatedWeekdaysMap);

      setSelectedWeekdays((prevSelectedWeekdays) =>
        prevSelectedWeekdays.includes(weekday)
          ? prevSelectedWeekdays.filter((day) => day !== weekday)
          : [...prevSelectedWeekdays, weekday]
      );
    }
  };
  const userType = getItemInLocalStorage("USERTYPE");
  console.log(userType);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResp = await getHostList(siteId);
        const hostOptions = usersResp.data.hosts.map((host) => ({
          value: host.id,
          label: host.name,
        }));
        setHosts(hostOptions);
        console.log(usersResp);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchVisitorCategory = async () => {
      try {
        const visitorCat = await getVisitorStaffCategory();
        setStaffCategories(visitorCat.data.categories);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
    fetchVisitorCategory();
  }, []);
  const handleHostChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      host: selectedOption?.value || "",
    }));
  };
  // const handleHostChange = (selectedOption) => {
  //   setFormData({ ...formData, host: selectedOption?.value || "" });
  // };
  const handleOpenCamera = () => {
    setShowWebcam(true);
  };

  const handleCloseCamera = () => {
    setShowWebcam(false);
  };
  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc);
    setShowWebcam(false);
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (files, fieldName) => {
    // Changed to receive 'files' directly
    setFormData({
      ...formData,
      [fieldName]: files,
    });
    console.log(fieldName);
  };

  const handlePassStartDateChange = (event) => {
    const selectedDateTime = event.target.value + ":00";
    setPassStartDate(selectedDateTime);

    if (passEndDate && selectedDateTime > passEndDate) {
      setPassEndDate("");
      toast.error("End date cannot be earlier than the start date.");
    }
  };

  const handlePassEndDateChange = (event) => {
    const selectedDateTime = event.target.value + ":00";

    if (passStartDate && selectedDateTime < passStartDate) {
      toast.error("End date cannot be earlier than the start date.");
      return;
    }

    setPassEndDate(selectedDateTime);
  };

  return (
    <div className="flex justify-center items-center  w-full p-4 mb-10">
      <div className="md:border border-gray-300 rounded-lg md:p-4 w-full md:mx-4 ">
        <h2
          style={{ background: themeColor }}
          className="text-center md:text-xl font-bold p-2 bg-black rounded-md text-white"
        >
          {getHeadingText()}
        </h2>
        <br />
        {userType !== "security_guard" && (
          <div>
            {behalf !== "Cab" && behalf !== "Delivery" && (
              <div
                onClick={handleImageClick}
                className="cursor-pointer flex justify-center items-center my-4"
              >
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    // src={imageFile || image}
                    alt="Uploaded"
                    className="border-4 border-gray-300 rounded-full w-40 h-40 object-cover"
                  />
                ) : (
                  <img
                    src={image}
                    alt="Default"
                    className="border-4 border-gray-300 rounded-full w-40 h-40 object-cover"
                  />
                )}
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  accept=".jpg, .jpeg, .png"
                />
              </div>
            )}
          </div>
        )}
        {userType === "security_guard" && (
          <div className="flex justify-center">
            {!showWebcam ? (
              <button onClick={handleOpenCamera}>
                <img
                  src={capturedImage || image}
                  alt="Uploaded"
                  className="border-4 border-gray-300 rounded-full w-40 h-40 object-cover"
                />
              </button>
            ) : (
              <div>
                <div className="rounded-full">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-full w-60 h-60 object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center my-2 items-center">
                  <button
                    onClick={capture}
                    className="bg-green-400 rounded-md text-white p-1 px-4"
                  >
                    Capture
                  </button>
                  <button
                    onClick={handleCloseCamera}
                    className="bg-red-400 rounded-md text-white p-1 px-4"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex md:flex-row flex-col  my-5 gap-10">
          <div className="flex gap-2 flex-col">
            <h2 className="font-semibold">Visitor Type :</h2>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="Guest"
                  name="attendance"
                  value="Guest"
                  checked={selectedVisitorType === "Guest"}
                  onChange={handleVisitorTypeChange}
                />
                <label htmlFor="Guest" className="font-semibold ">
                  Guest
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="Support Staff"
                  name="attendance"
                  value="Support Staff"
                  checked={selectedVisitorType === "Support Staff"}
                  onChange={handleVisitorTypeChange}
                />
                <label htmlFor="Support Staff" className="font-semibold ">
                  Support Staff
                </label>
              </div>
            </div>
          </div>
          {/* {userType !== "security_guard" && ( */}
          <div className="flex gap-2 flex-col">
            <h2 className="font-semibold">Visiting Frequency :</h2>
            <div className="flex items-center gap-4 ">
              <div className="flex items-center gap-2 ">
                <input
                  type="radio"
                  id="Once"
                  name="frequency"
                  value="Once"
                  checked={selectedFrequency === "Once"}
                  onChange={handleFrequencyChange}
                />
                <label htmlFor="Once" className="font-semibold">
                  Once
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="Frequently"
                  name="frequency"
                  value="Frequently"
                  checked={selectedFrequency === "Frequently"}
                  onChange={handleFrequencyChange}
                />
                <label htmlFor="Frequently" className="font-semibold ">
                  Frequently
                </label>
              </div>
            </div>
          </div>
          {/* )} */}
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {selectedVisitorType === "Support Staff" && (
            <div className="grid gap-2 items-center w-full">
              <label htmlFor="" className="font-medium">
                Support Category :
              </label>
              <select
                className="border border-gray-400 p-2 rounded-md"
                value={formData.supportCategory}
                onChange={handleChange}
                name="supportCategory"
              >
                <option value="">Select Support Staff Category</option>
                {staffCategories.map((staffCat) => (
                  <option value={staffCat.id} key={staffCat.id}>
                    {staffCat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {behalf !== "Cab" && (
            <div className="grid gap-2 items-center w-full">
              <label htmlFor="visitorName" className="font-semibold">
                Visitor Name:{" "}
                <span className="text-red-500 font-medium px-1">*</span>
              </label>
              <input
                value={formData.visitorName}
                onChange={handleChange}
                type="text"
                name="visitorName"
                id="visitorName"
                className="border border-gray-400 p-2 rounded-md"
                placeholder="Enter Visitor Name"
              />
            </div>
          )}
          {behalf !== "Cab" && (
            <>
              <div className="grid gap-2 items-center w-full">
                <label htmlFor="mobileNumber" className="font-semibold">
                  Mobile Number:
                  <span className="text-red-500 font-medium px-1">*</span>
                </label>
                <input
                  type="number"
                  value={formData.mobile}
                  onChange={handleChange}
                  name="mobile"
                  id="mobileNumber"
                  className="border border-gray-400 p-2 rounded-md"
                  placeholder="Enter Mobile Number"
                />
              </div>
              {userType === "security_guard" && (
                <div className="grid gap-2 items-center w-full">
                  <label htmlFor="" className="font-medium">
                    Host :
                    <span className="text-red-500 font-medium px-1">*</span>
                  </label>
                  <Select
                    options={hosts}
                    value={
                      hosts.find((option) => option.value === formData.host) ||
                      null
                    }
                    // value={hostOptions.find(
                    //   (option) => option.value === formData.host
                    // )}
                    onChange={handleHostChange}
                    placeholder="Select Person to meet"
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>
              )}
            </>
          )}

          {/* <div className="grid gap-2 items-center w-full">
            <label htmlFor="">Host</label>
            <select className="border border-gray-400 p-2 rounded-md"><option value="">Select Person to meet</option>
            <option value="">Mittu</option></select>
            
            </div> */}

          {behalf !== "Delivery" && behalf !== "Cab" && (
            <div className="grid gap-2 items-center w-full">
              <label htmlFor="additionalVisitor" className="font-semibold">
                Pass Number
              </label>
              <input
                type="number"
                id="additionalVisitor"
                className="border border-gray-400 p-2 rounded-md"
                placeholder="Enter Pass number"
              />
            </div>
          )}

          {behalf !== "Delivery" && behalf !== "Cab" && (
            <div className="grid gap-2 items-center w-full">
              <label htmlFor="comingFrom" className="font-semibold">
                Coming from:{" "}
                <span className="text-red-500 font-medium px-1">*</span>
              </label>
              <input
                type="text"
                id="comingFrom"
                className="border border-gray-400 p-2 rounded-md"
                placeholder="Enter Origin"
                value={formData.comingFrom}
                name="comingFrom"
                onChange={handleChange}
              />
            </div>
          )}

          <div className="grid gap-2 items-center w-full">
            <label htmlFor="vehicleNumber" className="font-semibold">
              Vehicle Number:
            </label>
            <input
              type="text"
              id="vehicleNumber"
              className="border border-gray-400 p-2 rounded-md"
              placeholder="Enter Vehicle Number"
              value={formData.vehicleNumber}
              name="vehicleNumber"
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2 items-center w-full">
            <label htmlFor="expectedDate" className="font-semibold">
              Expected Date:
            </label>
            <input
              type="date"
              id="expectedDate"
              className="border border-gray-400 p-2 rounded-md"
              value={formData.expDate || new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              name="expDate"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid gap-2 items-center w-full">
            <label htmlFor="expectedTime" className="font-semibold">
              Expected Time:
            </label>
            <input
              type="time"
              name="expTime"
              id="expectedTime"
              value={
                formData.expTime || new Date().toLocaleTimeString().slice(0, 5)
              }
              className="border border-gray-400 p-2 rounded-md"
              onChange={handleChange}
            />
          </div>

          {behalf !== "Delivery" && behalf !== "Cab" && (
            <div className="grid gap-2 items-center w-full">
              <label htmlFor="purpose" className="font-semibold">
                Visit Purpose:
              </label>
              <select
                id="purpose"
                className="border border-gray-400 p-2 rounded-md"
                value={formData.purpose}
                onChange={handleChange}
                name="purpose"
              >
                <option value="">Select Purpose</option>
                <option value="Meeting">Meeting</option>
                <option value="Delivery">Delivery</option>
                <option value="Personal">Personal</option>
                <option value="Fitout Staff">Fitout Staff</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
        </div>
        <span className="my-2">
          {/* {userType !== "security_guard" && (
            <>
              <input
                type="checkbox"
                value={formData.hostApproval}
                checked={formData.hostApproval}
                onChange={() =>
                  setFormData((prevState) => ({
                    ...prevState,
                    hostApproval: !prevState.hostApproval,
                  }))
                }
                id="hostApproval"
              />
              &nbsp;<label htmlFor="">Skip Host Approval</label>
              &nbsp;&nbsp;&nbsp;
            </>
          )} */}
          <>
            <input
              type="checkbox"
              value={formData.hostApproval}
              checked={formData.hostApproval}
              onChange={() =>
                setFormData((prevState) => ({
                  ...prevState,
                  hostApproval: !prevState.hostApproval,
                }))
              }
              id="hostApproval"
            />
            &nbsp;<label htmlFor="">Skip Host Approval</label>
            &nbsp;&nbsp;&nbsp;
          </>
          <input
            type="checkbox"
            id="goods"
            value={formData.goodsInward}
            onChange={() =>
              setFormData((prevState) => ({
                ...prevState,
                goodsInward: !prevState.goodsInward,
              }))
            }
          />
          &nbsp;&nbsp;<label htmlFor="goods">Goods Inwards</label>
        </span>
        {formData.goodsInward && (
          <>
            <div className="grid grid-cols-3 gap-2  my-2">
              <div className="flex flex-col gap-2">
                <p className="font-medium">No. of Goods :</p>
                <input
                  type="number"
                  name="noOfGoods"
                  value={formData.noOfGoods}
                  onChange={handleChange}
                  id=""
                  className="border border-gray-400 p-2 rounded-md w-full"
                  placeholder="Enter Number "
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <p className="font-medium ">Description :</p>
                <textarea
                  name="goodsDescription"
                  value={formData.goodsDescription}
                  onChange={handleChange}
                  id=""
                  className="border border-gray-400 p-2 rounded-md w-full"
                  rows={1}
                  placeholder="Enter Description"
                ></textarea>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium">Attachments Related to goods </p>
              <FileInputBox
                handleChange={(files) =>
                  handleFileChange(files, "goodsAttachments")
                }
                fieldName={"goodsAttachments"}
              />
            </div>
          </>
        )}
        <h2 className="font-medium border-b-2 mt-5 border-black">
          Additional Visitor
        </h2>
        <div className="grid md:grid-cols-3 gap-3 mt-5">
          {visitors.map((visitor, index) => (
            <div key={index}>
              <div className="grid gap-2 items-center w-full">
                <label htmlFor="" className="font-semibold">
                  Name:
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  className="border border-gray-400 p-2 rounded-md"
                  value={visitor.name}
                  onChange={(event) => handleInputChange(index, event)}
                />
              </div>
              &nbsp;&nbsp;
              <div className="grid gap-2 items-center w-full">
                <label htmlFor="" className="font-semibold">
                  Mobile:
                </label>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  name="mobile"
                  className="border border-gray-400 p-2 rounded-md"
                  value={visitor.mobile}
                  onChange={(event) => handleInputChange(index, event)}
                />
                <button onClick={() => handleRemoveVisitor(index)}>
                  <FaTrash />
                </button>
                &nbsp;
              </div>
            </div>
          ))}

          <div>
            <button
              onClick={handleAddVisitor}
              className="bg-green-500 text-white hover:bg-gray-700 font-semibold py-2 px-4 rounded"
            >
              Add Additional Visitor
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 ">
          <div className="flex flex-col">
            <p className="font-medium"> Pass Valid From :</p>
            <input
              type="datetime-local"
              min={todayDate}
              value={passStartDate}
              // onChange={(event) => setPassStartDate(event.target.value)}
              onChange={handlePassStartDateChange}
              className="border border-gray-400 p-2 rounded-md placeholder:text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="font-medium">Pass Valid To :</p>
            <input
              type="datetime-local"
              min={todayDate}
              value={passEndDate}
              // onChange={(event) => setPassEndDate(event.target.value)}
              onChange={handlePassEndDateChange}
              className="border border-gray-400 p-2 rounded-md placeholder:text-sm w-full"
            />
          </div>
        </div>
        {selectedFrequency === "Frequently" && (
          <div className="flex flex-col gap-2 my-2">
            <p className="font-medium">Select Permitted Days:</p>

            <div className="flex gap-4 flex-wrap ">
              {weekdaysMap.map((weekdayObj) => (
                <button
                  key={weekdayObj.day}
                  className={` rounded-md p-2 px-4 shadow-custom-all-sides font-medium ${
                    selectedWeekdays?.includes(weekdayObj.day)
                      ? // &&
                        // weekdayObj.isActive
                        "bg-green-400 text-white "
                      : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleWeekdaySelection(weekdayObj.day);
                  }}
                >
                  <a>{weekdayObj.day}</a>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-5 justify-center items-center my-4 border-t p-1">
          <button
            onClick={createNewVisitor}
            className="bg-red-400 text-white  font-semibold py-2 px-4 rounded-full flex items-center gap-2"
          >
            <MdClose /> Cancel
          </button>
          <button
            onClick={createNewVisitor}
            className="bg-green-400 text-white font-semibold py-2 px-4 rounded-full flex items-center gap-2"
          >
            <FaCheck /> Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAddVisitor;
