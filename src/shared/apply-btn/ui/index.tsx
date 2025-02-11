import { Button } from 'antd'
import { DoubleRightOutlined } from '@ant-design/icons'

import scss from './styles.module.scss'
import { useAppSelector, useAppDispatch } from '@/shared/hooks'
import {
  baseRawDataParsing,
  vsiDataParsing
} from '@/widgets/in-out-fields/utilities'
import { addPwPointers, addSubIntData, addVsiData } from '@/shared/store/slices'

export function ApplyButton() {
  const uiState = useAppSelector((storage) => storage.uiState)
  const dataState = useAppSelector((storage) => storage.dataState)
  const dispatch = useAppDispatch()

  return (
    <div className={scss['container']}>
      <Button
        size={'large'}
        icon={<DoubleRightOutlined />}
        onClick={() => {
          if (uiState.currentTab === 'Base') {
            const [subIntData, pwPointers] = baseRawDataParsing(
              uiState['node-type'],
              uiState.vendor,
              dataState.rawData[uiState.currentTab]
            )
            if (subIntData.length) {
              dispatch(addSubIntData(subIntData))
              dispatch(addPwPointers(pwPointers))
            }
          } else {
            if (!dataState.rawData[uiState.currentTab]) return
            dispatch(
              addVsiData(
                vsiDataParsing(
                  dataState.baseNodeIp,
                  dataState.rawData[uiState.currentTab],
                  dataState.pwPointers[uiState.currentTab],
                  dataState.subIntData.filter((sub) => sub['sub-type'] === 'L2')
                )
              )
            )
          }
        }}
      />
    </div>
  )
}
