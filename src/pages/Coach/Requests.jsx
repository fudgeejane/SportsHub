import { JoinRequests, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function CoachRequestsPage() {
  return (
    <SportsWorkflowPage title="Join Requests">
      {(system) => <JoinRequests system={system} coachOnly />}
    </SportsWorkflowPage>
  )
}
