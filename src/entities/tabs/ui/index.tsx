import { useAppDispatch, useAppSelector } from '@/shared/hooks'
import { changeCurrentTab } from '@/shared/store/slices'
import { InOutFields } from '@/widgets/in-out-fields'
import { Tabs } from 'antd'

export function PageTabs() {
  const dataStore = useAppSelector((storage) => storage.dataState)
  const dispatch = useAppDispatch()

  const tabsGen = () => {
    const tabsName = Object.keys(dataStore.rawData).filter(
      (item) => item !== 'Base'
    )

    const tabsList = [
      {
        label: 'Base',
        key: 'Base',
        children: <InOutFields />,
        disabled: false
      }
    ]

    tabsName.forEach((name) => {
      tabsList.push({
        label: name,
        key: name,
        children: <InOutFields />,
        disabled: !dataStore.baseNodeIp ? true : false
      })
    })

    return tabsList
  }

  const onChange = (newTab: string) => {
    dispatch(changeCurrentTab(newTab))
  }

  return (
    <Tabs
      onChange={onChange}
      defaultActiveKey="1"
      type="card"
      items={tabsGen()}
    />
  )
}
