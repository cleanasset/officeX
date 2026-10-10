import { redirect } from "next/navigation";

export default function NewContractWizardRoute() {
  redirect("/properties/rent-roll?action=new-contract&tab=contracts");
}
