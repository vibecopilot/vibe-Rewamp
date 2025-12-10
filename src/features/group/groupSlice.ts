import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GroupState {
  groups: string[];
  subGroups: Record<string, string[]>;
}

const initialState: GroupState = {
  groups: [],
  subGroups: {},
};

interface AddSubGroupPayload {
  groupName: string;
  subGroupName: string;
}

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<string>) => {
      state.groups.push(action.payload);
    },
    addSubGroup: (state, action: PayloadAction<AddSubGroupPayload>) => {
      const { groupName, subGroupName } = action.payload;
      if (!state.subGroups[groupName]) {
        state.subGroups[groupName] = [];
      }
      state.subGroups[groupName].push(subGroupName);
    },
  },
});

export const { addGroup, addSubGroup } = groupSlice.actions;
export default groupSlice.reducer;
