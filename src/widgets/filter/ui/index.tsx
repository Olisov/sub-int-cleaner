import { useEffect, useState } from 'react'
import { Tree, Checkbox, TreeProps } from 'antd'

import { useAppSelector, useAppDispatch } from '@/shared/hooks'
import { toggleSubIntStatus } from '@/shared/store/slices'
import {
  arrayComparison,
  activeGroupCheckboxGen,
  treeDataGen
} from '@/widgets/filter/utilities'

import scss from './styles.module.scss'

export function FilterTree() {
  const dataState = useAppSelector((storage) => storage.dataState)
  const dispatch = useAppDispatch()

  const treeData = treeDataGen(dataState.subIntData)
  const [defExpand, setDefExpand] = useState<string[]>([])

  const checkedSubs = dataState.subIntData
    .filter((item) => !item.skipped)
    .map((int) => int.id)

  const toggleSkipFlag = (diff: string[]) => {
    dispatch(toggleSubIntStatus(diff))
  }

  const onCheckTree: TreeProps['onCheck'] = (selectedKeysValue) => {
    if (selectedKeysValue instanceof Array) {
      const targetSubs = selectedKeysValue
        .filter((item) => {
          if (typeof item === 'string' && item.includes('group')) return false
          return true
        })
        .map((item) => item.toString())

      toggleSkipFlag(arrayComparison(targetSubs, checkedSubs))
    }
  }

  const onGroupCheck = (activeSubType: string[]) => {
    const targetSubs: string[] = []
    activeSubType.forEach((subType) => {
      targetSubs.push(
        ...dataState.subIntData
          .filter((item) => item['sub-type'] === subType)
          .map((int) => int.id)
      )
    })
    toggleSkipFlag(arrayComparison(targetSubs, checkedSubs))
  }

  useEffect(() => {
    if (!dataState.subIntData.length) setDefExpand([])
    else setDefExpand(treeData.map((item) => item.key as string))
  }, [dataState.subIntData, treeData])

  return (
    <>
      <Checkbox.Group
        className={scss['checkbox-group']}
        options={['L2', 'L3']}
        value={activeGroupCheckboxGen(dataState.subIntData)}
        onChange={onGroupCheck}
      />
      <Tree
        checkable
        showIcon
        treeData={treeData}
        expandedKeys={defExpand}
        onExpand={(expandList) => {
          setDefExpand(expandList as string[])
        }}
        selectable={false}
        onCheck={onCheckTree}
        checkedKeys={checkedSubs}
      />
    </>
  )
}
