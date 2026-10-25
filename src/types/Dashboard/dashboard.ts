export interface DashboardSummaryDto {
  totalCapacity: number
  activeSessionsCount: number
  reservedCount: number
  unavailableCapacity: number
  availableCapacity: number
  occupancyRate: number
  activeParkingAreasCount: number
  activeSubscriptionsCount: number
}

export interface ParkingAreaOccupancyDto {
  id: number
  parkingCode: string
  name: string
  vehicleType: number
  parkingMode: number
  status: number
  capacity: number
  activeSessionsCount: number
  reservedCount: number
  unavailableCapacity: number
  availableCapacity: number
  occupancyPercentage: number
}

export interface ParkingActivityDto {
  periodLabel: string
  periodDate: string
  checkInCount: number
  checkOutCount: number
}

export interface RecentActivityDto {
  activityType: number | 'CheckIn' | 'CheckOut'
  parkingSessionId: number
  ticketCode: string
  plateNumber: string | null
  parkingAreaId: number
  parkingAreaName: string
  spotCode: string | null
  staffId: number | null
  staffName: string | null
  eventTime: string
  localEventTime: string
}

export interface SubscriptionStatusCount {
  status: number
  subscriptionStatusName: string
  count: number
}

export interface AdminDashboardData {
  summary: DashboardSummaryDto
  parkingAreas: ParkingAreaOccupancyDto[]
  activity: ParkingActivityDto[]
  recentActivities: RecentActivityDto[]
  subscriptions: SubscriptionStatusCount[]
}

export interface StaffDashboardData {
  summary: DashboardSummaryDto
  parkingAreas: ParkingAreaOccupancyDto[]
  recentActivities: RecentActivityDto[]
}

export interface GetParkingActivityInput {
  fromDate: string
  toDate: string
  groupBy?: number
}

export interface GetRecentActivitiesInput {
  maxCount?: number
}
