import AppUI from "@/components/AppUI";
import { auth } from "@trigger.dev/sdk/v3";

export default async function Home() {
  const triggerToken = await auth.createTriggerPublicToken("llm-battle", {
    multipleUse: true, // ❌ Be careful with this option
  });

  return <AppUI triggerToken={triggerToken} />;
}
