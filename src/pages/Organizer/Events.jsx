import { OrganizerEvents, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerEventsPage() {
  return (
    <SportsWorkflowPage title="Event Management">
      {(system) => <OrganizerEvents system={system} />}
    </SportsWorkflowPage>
  )
}
