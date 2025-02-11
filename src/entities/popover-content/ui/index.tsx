import scss from './style.module.scss'

type propsType = {
  previewList: string[]
  listName: string
}

export function PopoverContent({ previewList, listName }: propsType) {
  if (previewList.length < 1) return null
  return (
    <ul className={scss['ui']}>
      {previewList.map((item) => (
        <li key={`${listName} ${item}`} className={scss['li']}>
          {item}
        </li>
      ))}
    </ul>
  )
}
