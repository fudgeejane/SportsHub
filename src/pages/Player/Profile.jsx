import { PlayerProfile, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function PlayerProfilePage() {
  return (
    <SportsWorkflowPage title="Player Profile">
      {(system) => <PlayerProfile system={system} />}
    </SportsWorkflowPage>
  )
}
