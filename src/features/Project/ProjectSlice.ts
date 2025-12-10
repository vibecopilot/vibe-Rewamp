import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EmailOption {
  value: string;
  label: string;
}

interface AssignToItem {
  user_id: string;
  email: string;
}

interface BoardData {
  assign_to: AssignToItem[];
  [key: string]: unknown;
}

interface FetchBoardPayload {
  board: BoardData;
  data: unknown;
  board_view?: string;
}

interface BoardState {
  data: BoardData | null;
  isLoading: boolean;
  error: string | null;
  activeView: string;
  selectedEmail: EmailOption[];
  taskData: unknown;
}

const initialState: BoardState = {
  data: null,
  isLoading: false,
  error: null,
  activeView: "Kanban",
  selectedEmail: [],
  taskData: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    fetchBoardDataStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBoardDataSuccess: (state, action: PayloadAction<FetchBoardPayload>) => {
      const data = action.payload;
      state.data = data.board;
      state.taskData = data.data;
      state.activeView = data.board_view || "Kanban";
      state.selectedEmail = data.board.assign_to.map((email) => ({
        value: email.user_id,
        label: email.email,
      }));
      state.isLoading = false;
    },
    fetchBoardDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateActiveView: (state, action: PayloadAction<string>) => {
      state.activeView = action.payload;
    },
  },
});

export const {
  fetchBoardDataStart,
  fetchBoardDataSuccess,
  fetchBoardDataFailure,
  updateActiveView,
} = boardSlice.actions;

export default boardSlice.reducer;
