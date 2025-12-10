import { createSlice } from "@reduxjs/toolkit";

const added = createSlice({
  name: "added",
  initialState: false as boolean,
  reducers: {
    setTrue: () => true,
    setFalse: () => false,
    toggle: (state) => !state,
  },
});

export const { setTrue, setFalse, toggle } = added.actions;
export default added.reducer;
