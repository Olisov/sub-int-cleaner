import { useAppSelector } from '@/shared/hooks'
import scss from './styles.module.scss'

export function Prompt() {
  const uiState = useAppSelector((storage) => storage.uiState)
  const dataState = useAppSelector((storage) => storage.dataState)

  if (uiState.currentTab !== 'Base')
    return (
      <div className={scss['prompt']}>
        {`dis cur | i (vsi[^-]|${dataState.baseNodeIp} negotiation-vc-id)`}
        &emsp;&emsp;
        {`dis vpls for | i ${dataState.baseNodeIp}`}
      </div>
    )

  return <div className={scss['prompt']}>dis cur int LoopBack0</div>
}
