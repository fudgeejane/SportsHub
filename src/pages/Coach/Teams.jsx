import { SportsWorkflowPage, TeamsMonitor } from '../../components/common/SportsWorkflowPanels'

export default function CoachTeamsPage() {
  return (
    <SportsWorkflowPage title="My Teams">
      {(system) => <TeamsMonitor system={system} coachOnly />}
    </SportsWorkflowPage>
  )
}
