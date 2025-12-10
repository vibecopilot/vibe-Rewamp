import React from "react";

const Selector = ({
  value,
  handleOptionChange,
  heading,
  subHeading,
  options,
  name,
}) => {
  return (
    <div>
      <label
        htmlFor="options"
        className="block text-sm font-medium text-gray-700"
      >
        {heading}
      </label>
      <select
        id="options"
        className="border p-1 px-4 border-gray-500 rounded-md"
        value={value}
        onChange={handleOptionChange}
        name={name}
      >
        <option value="">{subHeading}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Selector;
