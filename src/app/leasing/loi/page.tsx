import { redirect } from "next/navigation";

export default function LeasingLoiRoute() {
  redirect("/properties/rent-roll?tab=contracts");
}
