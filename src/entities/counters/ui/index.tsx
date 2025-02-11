import { Popover } from 'antd'
import { useAppSelector } from '../../../shared/hooks'
import { PopoverContent } from '../../popover-content'

import scss from './style.module.scss'

export function Counters() {
  const subIntData = useAppSelector((storage) => storage.dataState.subIntData)

  const l2subList = subIntData.filter((int) => int['sub-type'] === 'L2')
  const l2SubWithoutVsi = l2subList.filter((sub) => !sub.vsi)
  const l3subList = subIntData.filter((int) => int['sub-type'] === 'L3')
  const unknownSubList = subIntData.filter(
    (int) => int['sub-type'] === 'unknown'
  )

  if (subIntData.length < 1) return null

  return (
    <div className={scss['container']}>
      <Popover
        content={
          <PopoverContent
            previewList={subIntData.map(
              (sub) => `${sub['port-type']} ${sub['port-id']}.${sub.vid}`
            )}
            listName={'total'}
          />
        }
        placement="right"
      >
        <div className={scss['title']}>Total - {subIntData.length}</div>
      </Popover>

      {l2subList.length > 0 ? (
        <Popover
          content={
            <PopoverContent
              previewList={l2subList.map(
                (sub) => `${sub['port-type']} ${sub['port-id']}.${sub.vid}`
              )}
              listName={'l2sub'}
            />
          }
          placement="right"
        >
          <div>L2 sub - {l2subList.length}</div>
        </Popover>
      ) : null}

      {l2SubWithoutVsi.length > 0 ? (
        <Popover
          content={
            <PopoverContent
              previewList={l2SubWithoutVsi.map(
                (sub) => `${sub['port-type']} ${sub['port-id']}.${sub.vid}`
              )}
              listName={'l2sub without vsi'}
            />
          }
          placement="right"
        >
          <div>&nbsp; without vsi - {l2SubWithoutVsi.length}</div>
        </Popover>
      ) : null}

      {l3subList.length > 0 ? (
        <Popover
          placement="right"
          content={
            <PopoverContent
              previewList={l3subList.map(
                (sub) => `${sub['port-type']} ${sub['port-id']}.${sub.vid}`
              )}
              listName={'l3sub'}
            />
          }
        >
          <div>L3 sub - {l3subList.length}</div>
        </Popover>
      ) : null}
      {unknownSubList.length > 0 ? (
        <Popover
          placement="right"
          content={
            <PopoverContent
              previewList={unknownSubList.map(
                (sub) => `${sub['port-type']} ${sub['port-id']}.${sub.vid}`
              )}
              listName={'unknownSub'}
            />
          }
        >
          <div>Unknown - {unknownSubList.length}</div>
        </Popover>
      ) : null}
    </div>
  )
}
