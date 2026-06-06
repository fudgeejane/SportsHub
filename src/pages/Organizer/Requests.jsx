import { JoinRequests, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerRequestsPage() {
  return (
    <SportsWorkflowPage title="Registrations">
      {(system) => <JoinRequests system={system} />}
    </SportsWorkflowPage>
  )
}
