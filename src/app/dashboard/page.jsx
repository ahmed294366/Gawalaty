"use server"
import {Users,AlertTriangle, Calendar,Banknote} from 'lucide-react';
import { auth } from '@/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTab from './usersTab';
import BookingsTab from './bookingsTab';
import TripsTab from './tripsTab';
import ReviewsTab from './reviewsTab';
import ReportsTab from './reportsTab';
import { CategoriesTab } from "./categoriesTab";
import { FeaturesTab } from './featuresTab';
import { MessagesTab } from './messagesTab';
import { DashboardInfoAction } from "./dashboardActions"
import { redirect } from 'next/navigation';
import { FinancialTab } from './financialManagment';
import { PaymentTab } from './paymentTab';
import { LanguageTab } from './languageTab';
import { SettingTab } from './settingTab'; 

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session?.user?.role !== "admin") {
    redirect("/");
  }

  const data = await DashboardInfoAction()
  if(data?.error){
    throw new Error(data?.message)
  }
  const { 
    usersCount,
    guidesCount,
    unResolvedReportsCount,
    pendingBookings,
    confirmedBookingsAll,
    confirmedBookingsMonth,
    confirmedBookingsWeek } = data

  const totalRevenueAll = confirmedBookingsAll.reduce(
    (sum, b) => sum + b.people * b.trip.price,
    0
  );
  const totalRevenueMonth = confirmedBookingsMonth.reduce(
    (sum, b) => sum + b.people * b.trip.price,
    0
  );

  const totalRevenueWeek = confirmedBookingsWeek.reduce(
    (sum, b) => sum + b.people * b.trip.price,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Gawalaty platform</p>
        </div>
        {/* Revenue Overview - Major Card */}

        <Card className="mb-6 bg-linear-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className=" mb-1 text-xl font-semibold text-white">Revenue Overview</p>
                <h2 className="text-zinc-100 font-semibold">Platform Earnings</h2>
              </div>
              <Banknote className="h-12 w-12 text-emerald-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-emerald-100 text-sm mb-1 text-md font-semibold">This Week</p>
                <p className="text-3xl font-bold text-white">{totalRevenueWeek} LE</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-emerald-100 text-sm mb-1 text-md font-semibold">This Month</p>
                <p className="text-3xl font-bold text-white">{totalRevenueMonth} LE</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-emerald-100 text-md font-semibold mb-1 ">Total Revenue</p>
                <p className="text-3xl font-bold text-white">{totalRevenueAll} LE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-semibold text-zinc-600">Total Users</p>
                  <p className="text-2xl font-bold">{usersCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-semibold text-zinc-600">Active Guides</p>
                  <p className="text-2xl font-bold">{guidesCount}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-semibold text-zinc-600">Unresolved Reports</p>
                  <p className="text-2xl font-bold text-red-600">{unResolvedReportsCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md font-semibold text-zinc-600">Pending Bookings</p>
                  <p className="text-2xl font-bold">
                    {pendingBookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6  h-fit">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="financial">Transactions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="setting">Settings</TabsTrigger>
          </TabsList>

          <UsersTab session={session}/>
          <BookingsTab />
          <FinancialTab />
          <PaymentTab />
          <TripsTab />
          <ReviewsTab />
          <ReportsTab />
          <MessagesTab session={session}/>
          <CategoriesTab />
          <FeaturesTab/>
          <LanguageTab/>
          <SettingTab/>
        </Tabs>
      </div>
    </div>
  );
}

