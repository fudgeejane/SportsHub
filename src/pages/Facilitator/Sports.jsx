import { FacilitatorStatic, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function FacilitatorSportsPage() {
  return (
    <SportsWorkflowPage title="Sports Management">
      {() => <FacilitatorStatic path="/sports" />}
    </SportsWorkflowPage>
  )
}
