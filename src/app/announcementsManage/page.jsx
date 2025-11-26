import { ManageAnnouncementsComponent } from "./announcementComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function ManageAnnouncementsPage(){
    const session = await auth();
    if(!session?.user || session?.user?.role!=="admin"){
        redirect("/")
    }
    return (
        <ManageAnnouncementsComponent/>
    )
}