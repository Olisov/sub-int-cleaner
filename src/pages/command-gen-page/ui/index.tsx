import { Row, Col, Alert, Select, Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

import scss from './styles.module.scss'

import { Counters } from '@/entities/counters'

import {
  IVendor,
  INodeType,
  changeINodeType,
  resetUiState,
  resetDataState
} from '@/shared/store/slices'
import { useAppSelector, useAppDispatch } from '@/shared/hooks'
import { LoopbackInput } from '@/shared/loopback-input'
import { PageTabs } from '@/entities/tabs'

export function CommandGenPage() {
  const uiStore = useAppSelector((storage) => storage.uiState)
  const dataStore = useAppSelector((storage) => storage.dataState)
  const dispatch = useAppDispatch()

  const resetStore = () => {
    dispatch(resetUiState())
    dispatch(resetDataState())
  }

  const changeSelect = (evt: string) => {
    const [vendor, nodeClass] = evt.split(' ') as [IVendor, INodeType]
    if (vendor !== uiStore.vendor || nodeClass !== uiStore['node-type']) {
      resetStore()
      dispatch(changeINodeType({ nodeClass, vendor }))
    }
  }

  return (
    <main className={scss['main']}>
      <Row gutter={12}>
        <Col className={scss['column']} span={2}>
          <Select
            onChange={changeSelect}
            placeholder="Select a type"
            options={[
              { value: 'huawei switchL3', label: 'Atn' },
              { value: 'huawei router', label: 'Agg' },
              { value: 'n3com switchL3', label: 'N3-721' }
            ]}
            value={`${uiStore.vendor} ${uiStore['node-type']}`}
          />
          {uiStore['node-type'] !== 'router' ? <LoopbackInput /> : null}
        </Col>
        <Col className={scss['column']}>
          <Button
            type="primary"
            shape="round"
            icon={<ClearOutlined />}
            onClick={resetStore}
          />
        </Col>
        <Col className={scss['column']} span={1.5}>
          <Counters />
        </Col>
        <Col className={scss['column']} span={5}>
          {dataStore.infoMessages.map((message) => (
            <Alert
              message={message.text}
              type={message.type}
              showIcon
              key={message.id}
              closable
              style={{ textAlign: 'center' }}
            />
          ))}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <PageTabs />
        </Col>
      </Row>
    </main>
  )
}
