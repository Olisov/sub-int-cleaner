import {
  INodeType,
  IVendor,
  IPortType,
  ISubIntTypes,
  IpwPointers,
  IPwPointer,
  IL2Sub
} from '@/shared/store/slices'

export function baseRawDataParsing(
  nodeType: INodeType,
  vendor: IVendor,
  rawData: string
) {
  const interfacesList = rawData.replaceAll(/^int/gm, '%%int').split('%%')
  if (nodeType === 'switchL3') return switchL3IntParse(interfacesList, vendor)
  else return aggIntParse(interfacesList)
}

export function vsiDataParsing(
  baseNodeIp: string,
  rawData: string,
  pwPointers: IPwPointer[],
  subIntData: IL2Sub[]
) {
  if (rawData.includes('PwState')) {
    const vsiByPW = {} as Record<string, string>
    const splittedConf = rawData.split('\n')

    splittedConf.forEach((confStr) => {
      if (confStr.includes(baseNodeIp)) {
        const halvedConfStr = confStr.split(baseNodeIp)
        const matchedVsi = halvedConfStr[0].match(/\S+/)
        const matchedPw = halvedConfStr[1].match(/\d+/)
        if (matchedVsi && matchedPw) vsiByPW[matchedPw[0]] = matchedVsi[0]
      }
    })

    return getVsiByPw(pwPointers, subIntData, vsiByPW)
  } else return configVsiDataParsing(rawData, pwPointers, subIntData)
}

function configVsiDataParsing(
  rawData: string,
  pwPointers: IPwPointer[],
  subIntData: IL2Sub[]
) {
  const vsiByPW = {} as Record<string, string>
  const rawVsiList = rawData.replaceAll(/^vsi/gm, '%%vsi').split('%%')

  rawVsiList.forEach((rawVsi) => {
    const matchedVsi = rawVsi.match(/(?<=vsi )\S+/)
    const matchedPwAll = Array.from(
      rawVsi.matchAll(/(?<=negotiation-vc-id )\d+/g)
    )

    matchedPwAll.forEach((matchedPw) => {
      const pw = matchedPw[0]
      if (matchedVsi && !vsiByPW.hasOwnProperty(pw)) vsiByPW[pw] = matchedVsi[0]
    })
  })
  return getVsiByPw(pwPointers, subIntData, vsiByPW)
}

function getVsiByPw(
  pwPointers: IPwPointer[],
  subIntData: IL2Sub[],
  vsiByPW: Record<string, string>
) {
  const vsiById = {} as Record<string, string>

  pwPointers.forEach((pwPointer) => {
    const targetSub = subIntData.find((sub) => sub.id === pwPointer.id)
    if (targetSub) {
      const targetPw = targetSub[pwPointer['pw-type']]!['pw-id']
      if (vsiByPW[targetPw]) vsiById[pwPointer.id] = vsiByPW[targetPw]
    }
  })

  return vsiById
}

const randomHash = (): string => Math.random().toString(36).slice(2)

const vendorKeyDict = {
  'huawei': {
    pwTypeKey: 'pw-template',
    pwIdKey: new RegExp(/(?<=PW )\d+/),
    backupKey: 'secondary'
  },
  'n3com': {
    pwTypeKey: 'tagged vc-id',
    pwIdKey: new RegExp(/(?<=vc-id )\d+/),
    backupKey: 'backup'
  }
}

function switchL3IntParse(intList: string[], vendor: IVendor) {
  const resultArr = []
  const pwPointers = {} as IpwPointers

  for (const intConfig of intList) {
    if (!intConfig.match(/^interface/)) continue
    const splittedConf = intConfig.split(/\n/)
    const { portType, portId, vid } = subNameParse(splittedConf[0], vendor)
    if (!vid) continue

    const newId = randomHash()

    if (intConfig.includes(`${vendorKeyDict[vendor].pwTypeKey}`)) {
      const mainPw = {
        'peer-ip': '',
        'pw-id': ''
      }
      const backupPw = {
        'peer-ip': '',
        'pw-id': ''
      }

      splittedConf.forEach((configStr) => {
        if (configStr.includes('mpls l2vc')) {
          const backupFlag = configStr.includes(
            `${vendorKeyDict[vendor].backupKey}`
          )
          const matchedIp = configStr.match(
            /((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/
          )
          const matchedPw = configStr.match(vendorKeyDict[vendor].pwIdKey)

          if (matchedIp && matchedPw) {
            if (pwPointers.hasOwnProperty(matchedIp[0])) {
              pwPointers[matchedIp[0]].push({
                id: newId,
                'pw-type': backupFlag ? 'backup' : 'main'
              })
            } else {
              pwPointers[matchedIp[0]] = [
                {
                  id: newId,
                  'pw-type': backupFlag ? 'backup' : 'main'
                }
              ]
            }
            if (!backupFlag) {
              mainPw['peer-ip'] = matchedIp[0]
              mainPw['pw-id'] = matchedPw[0]
            } else {
              backupPw['peer-ip'] = matchedIp[0]
              backupPw['pw-id'] = matchedPw[0]
            }
          }
        }
      })
      resultArr.push({
        id: newId,
        'sub-type': 'L2',
        skipped: false,
        'port-type': portType,
        'port-id': portId,
        vid: vid,
        main: mainPw,
        backup: backupPw['peer-ip'] ? backupPw : undefined
      })
    } else {
      resultArr.push({
        id: newId,
        'sub-type': intConfig.includes('ip address') ? 'L3' : 'unknown',
        skipped: intConfig.includes('ip address') ? false : true,
        'port-type': portType,
        'port-id': portId,
        vid: vid
      })
    }
  }

  return [resultArr, pwPointers] as [ISubIntTypes[], IpwPointers]
}

function aggIntParse(intList: string[]) {
  const resultArr = []
  const pwPointers = {}

  for (const intConfig of intList) {
    if (!intConfig.match(/^interface/)) continue
    const splittedConf = intConfig.split(/\n/)
    const { portType, portId, vid } = huaweiSubNameParse(splittedConf[0])

    if (!vid) continue
    const newId = randomHash()

    if (intConfig.includes('l2 binding vsi')) {
      const matchedVsi = intConfig.match(/(?<=l2 binding vsi ).+/)

      resultArr.push({
        id: newId,
        'sub-type': 'L2',
        skipped: false,
        'port-type': portType,
        'port-id': portId,
        vid: vid,
        vsi: matchedVsi ? matchedVsi[0] : ''
      })
    } else {
      resultArr.push({
        id: newId,
        'sub-type': intConfig.includes('ip address') ? 'L3' : 'unknown',
        skipped: intConfig.includes('ip address') ? false : true,
        'port-type': portType,
        'port-id': portId,
        vid: vid
      })
    }
  }

  return [resultArr, pwPointers] as [ISubIntTypes[], IpwPointers]
}

function subNameParse(subName: string, vendor: IVendor) {
  if (vendor === 'huawei') return huaweiSubNameParse(subName)
  else return n3comSubNameParse(subName)
}

function huaweiSubNameParse(subName: string) {
  const subIntData = {} as {
    portType: IPortType
    portId: string
    vid: string
  }
  if (subName.includes('XGigabitEthernet')) subIntData.portType = 'XGi'
  else if (subName.includes('GigabitEthernet')) subIntData.portType = 'Gi'
  else if (subName.includes('Eth-trunk')) subIntData.portType = 'Eth-trunk'
  else if (subName.includes('Ethernet')) subIntData.portType = 'Ethernet'

  if (subIntData.portType === 'Eth-trunk') {
    const matchedPortId = subName.match(/(?<=Eth-trunk)\d{1,2}/)
    subIntData.portId = matchedPortId ? matchedPortId[0] : ''
  } else {
    const matchedPortId = subName.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,2})/)
    subIntData.portId = matchedPortId ? matchedPortId[0] : ''
  }
  const matchedVid = subName.match(/(?<=\.)\d{1,4}/)
  subIntData.vid = matchedVid ? matchedVid[0] : ''

  return subIntData
}

function n3comSubNameParse(subName: string) {
  const subIntData = {} as {
    portType: IPortType
    portId: string
    vid: string
  }
  if (subName.includes('port-channel')) subIntData.portType = 'PC'
  else if (subName.includes('tengigabitethernet')) subIntData.portType = 'Te'

  if (subIntData.portType === 'PC') {
    const matchedPortId = subName.match(/(?<=port-channel )\d{1,2}/)
    subIntData.portId = matchedPortId ? matchedPortId[0] : ''
  } else {
    const matchedPortId = subName.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,2})/)
    subIntData.portId = matchedPortId ? matchedPortId[0] : ''
  }
  const matchedVid = subName.match(/(?<=\.)\d{1,4}/)
  subIntData.vid = matchedVid ? matchedVid[0] : ''

  return subIntData
}
