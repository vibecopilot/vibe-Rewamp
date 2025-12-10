import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import wave from "/wave.png";

interface BackgroundState {
  background: string;
}

const initialState: BackgroundState = {
  background: wave,
};

export const backgroundSlice = createSlice({
  name: "background",
  initialState,
  reducers: {
    setBackground: (state, action: PayloadAction<string>) => {
      state.background = action.payload;
    },
  },
});

export const { setBackground } = backgroundSlice.actions;
export default backgroundSlice.reducer;
