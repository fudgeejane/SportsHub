import { SportsWorkflowPage, TeamStructureSetup } from '../../components/common/SportsWorkflowPanels'

export default function OrganizerTeamStructuresPage() {
  return (
    <SportsWorkflowPage title="Team Structure Setup">
      {(system) => <TeamStructureSetup system={system} />}
    </SportsWorkflowPage>
  )
}
