import { PlayerTeams, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function PlayerTeamsPage() {
  return (
    <SportsWorkflowPage title="Browse Teams">
      {(system) => <PlayerTeams system={system} />}
    </SportsWorkflowPage>
  )
}
