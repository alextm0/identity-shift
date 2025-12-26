import { getActiveSprint } from "@/data-access/sprints";
import { getRequiredSession } from "@/lib/auth/server";
import { ActiveSprintPill } from "./active-sprint-pill";

export async function ActiveSprintPillServer() {
  const session = await getRequiredSession();
  const activeSprint = await getActiveSprint(session.user.id);

  return <ActiveSprintPill sprint={activeSprint || null} />;
}

