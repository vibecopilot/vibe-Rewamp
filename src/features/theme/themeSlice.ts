import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  color: string;
}

// Updated to use the new theme color #7132CA
const initialState: ThemeState = {
  color: "#7132CA",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setColor: (state, action: PayloadAction<string>) => {
      state.color = action.payload;
    },
  },
});

export const { setColor } = themeSlice.actions;
export default themeSlice.reducer;
