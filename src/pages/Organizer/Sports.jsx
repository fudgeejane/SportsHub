import { OrganizerSports, SportsWorkflowPage } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerSportsPage() {
  return (
    <SportsWorkflowPage title="Sports Management">
      {(system) => <OrganizerSports system={system} />}
    </SportsWorkflowPage>
  )
}
