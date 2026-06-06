import { PlaceholderWorkflow, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerSchedulePage() {
  return (
    <SportsWorkflowPage title="Scheduling">
      {() => <PlaceholderWorkflow title="Scheduling" />}
    </SportsWorkflowPage>
  )
}
