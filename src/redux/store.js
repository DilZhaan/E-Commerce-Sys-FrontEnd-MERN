import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import orebiReducer from "./orebiSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedOrebiReducer = persistReducer(persistConfig, orebiReducer);
const persistedAuthReducer = persistReducer(
  {
    ...persistConfig,
    key: "auth"
  }, 
  authReducer
);
const persistedCartReducer = persistReducer(
  {
    ...persistConfig,
    key: "cart"
  },
  cartReducer
);

export const store = configureStore({
  reducer: { 
    orebiReducer: persistedOrebiReducer,
    auth: persistedAuthReducer,
    cart: persistedCartReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
