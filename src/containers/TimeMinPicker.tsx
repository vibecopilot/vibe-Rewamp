import React from "react";

const TimeMinPicker = ({ name, id, className }) => {
  return (
    <select name={name} id={id} className={className}>
      <option value="">Min</option>
      <option selected="selected" value="00">
        00
      </option>
      <option value="15">15</option>
      <option value="30">30</option>
      <option value="45">45</option>
    </select>
  );
};

export default TimeMinPicker;
