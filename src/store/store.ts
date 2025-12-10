// src/app/store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

// Reducers
import groupReducer from "../features/group/groupSlice";
import themeReducer from "../features/theme/themeSlice";
import fileExplorerReducer from "../features/FileExplorer/FileExplorer";
import fontSizeReducer from "../features/font/fontSizeSlice";
import backgroundReducer from "../features/theme/backgroundSlice";
import boardReducer from "../features/Project/ProjectSlice";
import addedReducer from "../features/Project/Added";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["theme"],
};

const rootReducer = combineReducers({
  group: groupReducer,
  theme: themeReducer,
  file: fileExplorerReducer,
  fontSize: fontSizeReducer,
  background: backgroundReducer,
  board: boardReducer,
  added: addedReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store setup
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["_persist"],
      },
    }),
});

export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
