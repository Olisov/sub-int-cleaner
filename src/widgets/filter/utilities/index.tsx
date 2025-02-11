import { TreeDataNode } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

import { ISubIntTypes } from '@/shared/store/slices'

type ITreeData = {
  title: string
  key: string
  icon?: React.ReactNode
}

export const activeGroupCheckboxGen = (subIntData: ISubIntTypes[]) => {
  const allL2 = subIntData.filter((int) => int['sub-type'] === 'L2')
  const allL3 = subIntData.filter((int) => int['sub-type'] === 'L3')
  const checkedL2 = subIntData.filter(
    (int) => int['sub-type'] === 'L2' && !int.skipped
  )
  const checkedL3 = subIntData.filter(
    (int) => int['sub-type'] === 'L3' && !int.skipped
  )

  const result = []
  if (checkedL2.length === allL2.length) result.push('L2')
  if (checkedL3.length === allL3.length) result.push('L3')

  return result
}

export function treeDataGen(subIntData: ISubIntTypes[]) {
  const treeData: TreeDataNode[] = []
  const intGroupName = new Set(
    subIntData.map((item) => `${item['port-type']}${item['port-id']}`)
  )

  intGroupName.forEach((port) => {
    const subPorts = subIntData
      .filter((item) => port === `${item['port-type']}${item['port-id']}`)
      .map((int) => {
        const portData = {
          title: `${int['port-type']}${int['port-id']}.${int.vid}`,
          key: int.id
        } as ITreeData
        if (int.hasOwnProperty('vsi')) portData.icon = <CheckCircleOutlined />
        return portData
      })

    treeData.push({
      title: port,
      key: `group ${port}`,
      children: subPorts
    })
  })

  return treeData
}

export const arrayComparison = (
  targetArr: string[],
  savedArr: string[]
): string[] => {
  if (targetArr.length > savedArr.length)
    return targetArr.filter((e) => savedArr.every((val) => val !== e))
  else return savedArr.filter((e) => targetArr.every((val) => val !== e))
}
