import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type IVendor = 'huawei' | 'n3com'
export type INodeType = 'router' | 'switchL3'

interface IUiState {
  currentTab: string
  'node-type': INodeType
  vendor: IVendor
}
interface IINodeType {
  nodeClass: INodeType
  vendor: IVendor
}

interface IInfoMassages {
  type: 'success' | 'info' | 'warning' | 'error'
  text: string
  id: string
}

const initUiState: IUiState = {
  'node-type': 'switchL3',
  vendor: 'huawei',
  currentTab: 'Base'
}

const uiState = createSlice({
  name: 'uiState',
  initialState: initUiState,
  reducers: {
    changeINodeType: (state, action: PayloadAction<IINodeType>) => {
      state['node-type'] = action.payload.nodeClass
      state.vendor = action.payload.vendor
    },
    changeCurrentTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload
    },
    resetUiState: (state) => ({
      'node-type': 'switchL3',
      vendor: 'huawei',
      currentTab: 'Base'
    })
  }
})

export const { changeINodeType, changeCurrentTab, resetUiState } =
  uiState.actions
export const uiStateReducer = uiState.reducer

export type IPortType = 'Eth-trunk' | 'Gi' | 'XGi' | 'Ethernet' | 'PC' | 'Te'

export interface IPw {
  'peer-ip': string
  'pw-id': string
}

export interface IL2Sub {
  id: string
  'sub-type': 'L2'
  skipped: boolean
  'port-type': IPortType
  'port-id': string
  vid: string
  main?: IPw
  backup?: IPw
  vsi?: string
}

interface ISubTemplate<T> {
  id: string
  'sub-type': T
  skipped: boolean
  'port-type': IPortType
  'port-id': string
  vid: string
}

export type TL3Sub = ISubTemplate<'L3'>
export type TEmptySub = ISubTemplate<'unknown'>

export type ISubIntTypes = IL2Sub | TL3Sub | TEmptySub

export interface IPwPointer {
  id: string
  'pw-type': 'main' | 'backup'
}

export type IpwPointers = Record<string, IPwPointer[]>

interface IDataState {
  baseNodeIp: string
  ipNodeInput: string
  subIntData: Array<ISubIntTypes>
  pwPointers: Record<string, IPwPointer[]>
  rawData: Record<string, string>
  infoMessages: IInfoMassages[]
}

type IRawDataAction = {
  tabName: string
  newData: string
}

const dataState = createSlice({
  name: 'dataState',
  initialState: {
    baseNodeIp: '',
    ipNodeInput: '',
    subIntData: [],
    pwPointers: {},
    rawData: { Base: '' },
    infoMessages: []
  } as IDataState,
  reducers: {
    saveBaseNodeIp: (state, action: PayloadAction<string>) => {
      state.ipNodeInput = action.payload

      const newValue = action.payload
        .trim()
        .match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)

      const ipErrorIdIndex = state.infoMessages.findIndex(
        (message) => message.id === 'ip-error'
      )

      if (newValue !== null) {
        if (state.baseNodeIp !== newValue[0]) state.baseNodeIp = newValue[0]
        if (ipErrorIdIndex >= 0)
          state.infoMessages = [
            ...state.infoMessages.slice(0, ipErrorIdIndex),
            ...state.infoMessages.slice(ipErrorIdIndex + 1)
          ]
      } else if (ipErrorIdIndex < 0) {
        state.infoMessages.push({
          type: 'error',
          text: 'Incorrect LoopBack',
          id: 'ip-error'
        })
      }
    },
    addSubIntData: (state, action: PayloadAction<ISubIntTypes[]>) => {
      state.subIntData = action.payload

      const subL2IntData = action.payload.filter(
        (sub) => sub['sub-type'] === 'L2'
      )
      const subL2WithoutVsi = subL2IntData.filter((sub) => !sub.vsi)

      const vsiWarnIdIndex = state.infoMessages.findIndex(
        (message) => message.id === 'vsi-warning'
      )
      if (subL2WithoutVsi.length > 0 && vsiWarnIdIndex < 0) {
        state.infoMessages.push({
          type: 'warning',
          text: 'lack of data: There are L2 sub without vsi',
          id: 'vsi-warning'
        })
      }
    },
    toggleSubIntStatus: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((id) => {
        const targetSub = state.subIntData.find((subInt) => subInt.id === id)
        if (targetSub) targetSub.skipped = !targetSub.skipped
      })
    },
    addPwPointers: (state, action: PayloadAction<IpwPointers>) => {
      state.pwPointers = action.payload

      const pwPointersKey = Object.keys(action.payload)
      pwPointersKey.forEach((key) => {
        if (!state.rawData.hasOwnProperty(key)) state.rawData[key] = ''
      })
    },
    addRawData: (state, action: PayloadAction<IRawDataAction>) => {
      state.rawData[action.payload.tabName] = action.payload.newData
    },
    addVsiData: (state, action: PayloadAction<Record<string, string>>) => {
      const updatedId = Object.keys(action.payload)

      updatedId.forEach((id) => {
        const targetSub = state.subIntData.find((sub) => sub.id === id)
        if (targetSub && targetSub['sub-type'] === 'L2' && !targetSub.vsi) {
          targetSub.vsi = action.payload[id]
        }
      })

      const l2subList = state.subIntData.filter(
        (int) => int['sub-type'] === 'L2'
      )
      const l2SubWithoutVsi = l2subList.filter((sub) => !sub.vsi)
      const vsiWarnIdIndex = state.infoMessages.findIndex(
        (message) => message.id === 'vsi-warning'
      )

      if (vsiWarnIdIndex >= 0 && l2SubWithoutVsi.length === 0) {
        state.infoMessages = [
          ...state.infoMessages.slice(0, vsiWarnIdIndex),
          ...state.infoMessages.slice(vsiWarnIdIndex + 1)
        ]
      }
    },

    resetDataState: (state) => ({
      baseNodeIp: '',
      ipNodeInput: '',
      subIntData: [],
      pwPointers: {},
      rawData: { Base: '' },
      infoMessages: []
    })
  }
})

export const {
  saveBaseNodeIp,
  addSubIntData,
  toggleSubIntStatus,
  addPwPointers,
  resetDataState,
  addRawData,
  addVsiData
} = dataState.actions
export const dataStateReducer = dataState.reducer
