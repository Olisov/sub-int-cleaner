import { Input, Tabs } from 'antd'
import { useAppSelector } from '@/shared/hooks'

import type { TabsProps } from 'antd'
import { IVendor, INodeType, ISubIntTypes } from '@/shared/store/slices'

const { TextArea } = Input

type ICommandProps = {
  vendor: IVendor
  nodeType: INodeType
  subIntList: ISubIntTypes[]
}

function baseCheckCommands({ vendor, nodeType, subIntList }: ICommandProps) {
  let commands = ''
  if (vendor === 'n3com') {
    subIntList.forEach((int) => {
      const portType = int['port-type'] === 'PC' ? 'po' : int['port-type']
      if (int['sub-type'] === 'L2') {
        commands += `show mpls l2vc ${portType} ${int['port-id']}.${int.vid} | i State\n`
      } else if (int['sub-type'] === 'L3') {
        commands += `show arp int ${portType} ${int['port-id']}.${int.vid}\n`
      } else {
        commands += `show int ${portType} ${int['port-id']}.${int.vid} | i status\n`
      }

      commands += '#\n'
    })
  } else if (nodeType === 'router') {
    subIntList.forEach((int) => {
      const portType = int['port-type'] === 'Eth-Trunk' ? 'unk' : ''

      if (int['sub-type'] === 'L3') {
        commands += `dis arp all | i ${portType}${int['port-id']}.${int.vid}\n`
      } else {
        commands += `dis int ${int['port-type']} ${int['port-id']}.${int.vid} | i state\n`
      }
      commands += '#\n'
    })
  } else {
    subIntList.forEach((int) => {
      const portType = int['port-type'] === 'Eth-Trunk' ? 'unk' : ''

      if (int['sub-type'] === 'L3') {
        commands += `dis arp all | i ${portType}${int['port-id']}.${int.vid}\n`
      } else if (int['sub-type'] === 'L2') {
        commands += `dis int ${int['port-type']} ${int['port-id']}.${int.vid} | i L2VPN\n`
      } else {
        commands += `dis int ${int['port-type']} ${int['port-id']}.${int.vid} | i state\n`
      }

      commands += '#\n'
    })
  }
  return commands
}

function baseDeleteCommands({ vendor, nodeType, subIntList }: ICommandProps) {
  let commands = ''

  if (vendor === 'n3com') {
    subIntList.forEach((int) => {
      const portType = int['port-type'] === 'PC' ? 'po' : int['port-type']
      commands += `no int ${portType} ${int['port-id']}.${int.vid}\n`
      commands += '#\n'
    })
  } else if (nodeType === 'router') {
    subIntList.forEach((int) => {
      if (int['sub-type'] === 'L2' && int.vsi) {
        commands += `int ${int['port-type']} ${int['port-id']}.${int.vid}\n`
        commands += ` un l2 binding vsi ${int.vsi} \n`
        commands += ' quit\n'
      }
      commands += `un int ${int['port-type']} ${int['port-id']}.${int.vid}\n`
      commands += '#\n'
    })
  } else {
    subIntList.forEach((int) => {
      if (int['sub-type'] === 'L2') {
        commands += `int ${int['port-type']} ${int['port-id']}.${int.vid}\n`
        if (int.backup) {
          commands += ` un mpls l2vc ${int.backup['peer-ip']} pw-template PW ${int.backup['pw-id']} secondary\n`
        }
        if (int.main) {
          commands += ` un mpls l2vc ${int.main['peer-ip']} pw-template PW ${int.main['pw-id']}\n`
        }
        commands += ' quit\n'
      }
      commands += `un int ${int['port-type']} ${int['port-id']}.${int.vid}\n`
      commands += '#\n'
    })
  }
  return commands
}

export function CommandForUse() {
  const uiState = useAppSelector((storage) => storage.uiState)
  const dataState = useAppSelector((storage) => storage.dataState)

  const curTab = uiState.currentTab
  const subIntList = dataState.subIntData.filter((item) => !item.skipped)
  const baseNodeIp = dataState.baseNodeIp

  function getCheckCommands() {
    if (curTab === 'Base') {
      return baseCheckCommands({
        vendor: uiState.vendor,
        nodeType: uiState['node-type'],
        subIntList: subIntList
      })
    } else {
      let commands = ''
      const subL2List = subIntList.filter((item) => item['sub-type'] === 'L2')
      if (!subL2List.length) return commands
      subL2List.forEach((sub) => {
        const pwPointer = dataState.pwPointers[curTab].find(
          (item) => item.id === sub.id
        )
        if (sub.vsi && pwPointer) {
          commands += `dis vsi n ${sub.vsi} pe ${baseNodeIp} | i ${sub[pwPointer['pw-type']]!['pw-id']}\n`
          commands += '#\n'
        }
      })
      return commands
    }
  }

  function getDeleteCommands() {
    if (curTab === 'Base') {
      return baseDeleteCommands({
        vendor: uiState.vendor,
        nodeType: uiState['node-type'],
        subIntList: subIntList
      })
    } else {
      let commands = ''
      const subL2List = subIntList.filter((item) => item['sub-type'] === 'L2')
      if (!subL2List.length) return commands
      subL2List.forEach((sub) => {
        const pwPointer = dataState.pwPointers[curTab].find(
          (item) => item.id === sub.id
        )
        if (sub.vsi && pwPointer) {
          commands += `vsi ${sub.vsi}\n`
          commands += '  pwsignal ldp\n'
          commands += `  un peer ${baseNodeIp} negotiation-vc-id ${sub[pwPointer['pw-type']]!['pw-id']}\n`
          commands += '#\n'
        }
      })
      return commands
    }
  }

  function getVsiInfo() {
    let vsiInfo = ''
    const subL2List = subIntList.filter((item) => item['sub-type'] === 'L2')
    if (!subL2List.length) return vsiInfo
    subL2List.forEach((sub) => {
      vsiInfo += sub.vsi ? `vsi ${sub.vsi}\n` : '--\n'
    })
    return vsiInfo
  }

  const items: TabsProps['items'] = [
    {
      key: 'Pre-check commands',
      label: 'Pre-check commands',
      children: (
        <TextArea
          autoSize={{ minRows: 27, maxRows: 27 }}
          value={getCheckCommands()}
        />
      )
    },
    {
      key: 'Delete commands',
      label: 'Delete commands',
      children: (
        <TextArea
          autoSize={{ minRows: 27, maxRows: 27 }}
          value={getDeleteCommands()}
        />
      )
    }
  ]
  if (curTab === 'Base') {
    items.push({
      key: 'Vsi info',
      label: 'Vsi info',
      children: (
        <TextArea
          autoSize={{ minRows: 27, maxRows: 27 }}
          value={getVsiInfo()}
        />
      )
    })
  }

  return <Tabs defaultActiveKey="1" items={items} />
}
