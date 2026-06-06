import { FacilitatorStatic, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function FacilitatorTeamsPage() {
  return (
    <SportsWorkflowPage title="Teams">
      {() => <FacilitatorStatic path="/teams" />}
    </SportsWorkflowPage>
  )
}
