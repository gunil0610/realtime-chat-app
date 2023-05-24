import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FC } from "react";

interface DashboardPageProps {}

const DashboardPage = async ({}) => {
    const session = await getServerSession(authOptions);

    return <div>DashboardPage</div>;
};

export default DashboardPage;
