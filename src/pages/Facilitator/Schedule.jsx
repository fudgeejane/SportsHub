import { FacilitatorStatic, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function FacilitatorSchedulePage() {
  return (
    <SportsWorkflowPage title="Scheduling">
      {() => <FacilitatorStatic path="/schedule" />}
    </SportsWorkflowPage>
  )
}
