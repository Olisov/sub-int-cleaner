import { Input } from 'antd'
import { useAppSelector, useAppDispatch } from '@/shared/hooks'
import { saveBaseNodeIp } from '@/shared/store/slices'

export function LoopbackInput() {
  const dataStore = useAppSelector((storage) => storage.dataState)
  const dispatch = useAppDispatch()

  return (
    <Input
      placeholder="Node loopback"
      onChange={(evt) => {
        dispatch(saveBaseNodeIp(evt.target.value))
      }}
      value={dataStore.ipNodeInput}
      status={
        dataStore.infoMessages.findIndex((item) =>
          item.text.includes('LoopBack')
        ) >= 0
          ? 'error'
          : ''
      }
    />
  )
}
