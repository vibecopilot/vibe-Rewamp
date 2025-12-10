import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const fontSizeSlice = createSlice({
  name: "fontSize",
  initialState: "text-sm" as string,
  reducers: {
    setFontSize: (_state, action: PayloadAction<string>) => action.payload,
  },
});

export const { setFontSize } = fontSizeSlice.actions;
export default fontSizeSlice.reducer;
