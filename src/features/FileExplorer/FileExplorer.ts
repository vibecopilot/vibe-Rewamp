import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FileItem {
  type: "folder" | "file";
  name: string;
  path: string;
}

interface AddItemPayload {
  name: string;
  path: string;
}

const fileExplorerSlice = createSlice({
  name: "fileExplorer",
  initialState: [] as FileItem[],
  reducers: {
    addFolder: (state, action: PayloadAction<AddItemPayload>) => {
      state.push({ type: "folder", name: action.payload.name, path: action.payload.path });
    },
    addFile: (state, action: PayloadAction<AddItemPayload>) => {
      state.push({ type: "file", name: action.payload.name, path: action.payload.path });
    },
  },
});

export const { addFolder, addFile } = fileExplorerSlice.actions;
export default fileExplorerSlice.reducer;
