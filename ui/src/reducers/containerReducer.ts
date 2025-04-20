import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ContainerStateType,
} from '../../ui-types';
import Client from '../models/Client';
import { ContainerPS } from '../../../types';

const initialState: ContainerStateType = {
  runningList: [],
  stoppedList: [],
  networkList: [],
  errorModalOn: false,
};

/**
 * @abstract Fetches containers and updates reducer
 */
export const fetchRunningContainers = createAsyncThunk(
  'containers/fetchRunningContainers',
  async () => {
    const result: ContainerPS[] = await Client.ContainerService.getRunningContainers();
    console.log("result", result)
    console.log("type of result", typeof result)
    return result;
  }
)

export const fetchStoppedContainers = createAsyncThunk(
  'containers/fetchStoppedContainers',
  async () => {
    const result: ContainerPS[] = await Client.ContainerService.getStoppedContainers();
    return result;
  }
)

export const containerSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: { 
    removeContainer: (state, action: PayloadAction<string>) => {
      state.stoppedList = state.stoppedList.filter((container) => container.ID !== action.payload);
    },
    displayErrorModal: (state, action: PayloadAction<boolean>) => {
      state.errorModalOn = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        fetchRunningContainers.fulfilled, (state, action) => {
          state.runningList = action.payload;
        }
    )
      .addCase(
        fetchStoppedContainers.fulfilled, (state, action) => {
          state.stoppedList = action.payload;
      }
    )
      .addCase(
        fetchRunningContainers.rejected, (state, action) => {
          state.errorModalOn = true;
       }
     ) 
  },

}
);

export const {
  // stopRunningContainer,
  // runStoppedContainer,
  removeContainer,
  displayErrorModal,
} = containerSlice.actions;

export default containerSlice.reducer;


