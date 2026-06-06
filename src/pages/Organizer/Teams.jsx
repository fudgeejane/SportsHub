import { SportsWorkflowPage, TeamsMonitor } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerTeamsPage() {
  return (
    <SportsWorkflowPage title="Teams">
      {(system) => <TeamsMonitor system={system} />}
    </SportsWorkflowPage>
  )
}
