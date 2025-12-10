import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  color: string;
}

const initialState: ThemeState = {
  color: "radial-gradient( circle 897px at 9% 80.3%,  rgba(55,60,245,1) 0%, rgba(234,161,15,0.90) 100.2% )",
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
