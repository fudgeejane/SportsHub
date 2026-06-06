import { JoinRequests, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function PlayerRequestsPage() {
  return (
    <SportsWorkflowPage title="My Requests">
      {(system) => <JoinRequests system={system} playerOnly />}
    </SportsWorkflowPage>
  )
}
