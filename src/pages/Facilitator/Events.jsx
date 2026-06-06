import { FacilitatorStatic, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function FacilitatorEventsPage() {
  return (
    <SportsWorkflowPage title="Event Management">
      {() => <FacilitatorStatic path="/events" />}
    </SportsWorkflowPage>
  )
}
