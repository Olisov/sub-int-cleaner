import { Row, Col, Input } from 'antd'

import { useAppSelector, useAppDispatch } from '@/shared/hooks'

import { addRawData } from '@/shared/store/slices'
import { ApplyButton } from '@/shared/apply-btn'
import { FilterTree } from '@/widgets/filter'
import { Prompt } from '@/entities/prompt'
import { CommandForUse } from '@/entities/commands-for-use'

const { TextArea } = Input

export function InOutFields() {
  const dispatch = useAppDispatch()
  const uiState = useAppSelector((storage) => storage.uiState)
  const dataState = useAppSelector((storage) => storage.dataState)

  return (
    <Row gutter={12}>
      <Col span={9}>
        <Prompt />
        <TextArea
          autoSize={{ minRows: 28, maxRows: 28 }}
          value={dataState.rawData[uiState.currentTab]}
          onChange={(evt) =>
            dispatch(
              addRawData({
                tabName: uiState.currentTab,
                newData: evt.target.value
              })
            )
          }
        />
      </Col>
      <Col span={6}>
        <ApplyButton />
        <FilterTree />
      </Col>
      <Col span={9}>
        <CommandForUse />
      </Col>
    </Row>
  )
}
