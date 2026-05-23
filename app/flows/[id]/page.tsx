import { notFound } from "next/navigation";
import { FlowRunnerClient } from "@/app/flows/[id]/FlowRunnerClient";
import { getGuidedFlowById, getGuidedFlowCatalog } from "@/lib/guided-flows";

export function generateStaticParams() {
  return getGuidedFlowCatalog().map((flow) => ({ id: flow.id }));
}

export default function FlowRunnerPage({ params }: { params: { id: string } }) {
  const flow = getGuidedFlowById(params.id);
  if (!flow) notFound();
  return <FlowRunnerClient flow={flow} />;
}
