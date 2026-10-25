import { useEffect, useState } from 'react'
import { getSubscriptions } from '../../services/subscriptionService'
import {
  getDashboardSummary,
  getParkingActivity,
  getParkingAreaOccupancy,
  getRecentActivities,
} from '../../services/dashboardService'
import type {
  AdminDashboardData,
  ParkingActivityDto,
  StaffDashboardData,
  SubscriptionStatusCount,
} from '../../types/Dashboard/dashboard'

export type DashboardActivityPeriod = 7 | 30 | 90

const localDateQueryValue = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getActivityRange = (period: DashboardActivityPeriod) => {
  const to = new Date()
  const from = new Date(to)
  from.setDate(to.getDate() - period + 1)
  return {
    fromDate: localDateQueryValue(from),
    toDate: localDateQueryValue(to),
    groupBy: 1,
  }
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const getSubscriptionStatusCounts = async (
  activeSubscriptionsCount: number,
): Promise<SubscriptionStatusCount[]> => {
  const [pending, expired, canceled] = await Promise.all([
    getSubscriptions({ status: 0, skipCount: 0, maxResultCount: 1 }),
    getSubscriptions({ status: 2, skipCount: 0, maxResultCount: 1 }),
    getSubscriptions({ status: 3, skipCount: 0, maxResultCount: 1 }),
  ])

  return [
    { status: 1, subscriptionStatusName: 'In use', count: activeSubscriptionsCount },
    { status: 0, subscriptionStatusName: 'Pending', count: pending.totalCount },
    { status: 2, subscriptionStatusName: 'Expired', count: expired.totalCount },
    { status: 3, subscriptionStatusName: 'Canceled', count: canceled.totalCount },
  ]
}

export const useAdminDashboardData = (
  period: DashboardActivityPeriod,
  retryKey: number,
) => {
  const [coreData, setCoreData] = useState<Omit<AdminDashboardData, 'activity'> | null>(null)
  const [activity, setActivity] = useState<ParkingActivityDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    const loadDashboard = async () => {
      try {
        const [summary, parkingAreas, recentActivities] = await Promise.all([
          getDashboardSummary(),
          getParkingAreaOccupancy(),
          getRecentActivities({ maxCount: 10 }),
        ])
        const subscriptions = await getSubscriptionStatusCounts(summary.activeSubscriptionsCount)
        if (!isCurrent) return
        setCoreData({ summary, parkingAreas, recentActivities, subscriptions })
      } catch (loadError) {
        if (!isCurrent) return
        setCoreData(null)
        setError(getErrorMessage(loadError, 'Unable to load the admin dashboard.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      isCurrent = false
    }
  }, [retryKey])

  useEffect(() => {
    let isCurrent = true
    setIsActivityLoading(true)
    setActivityError(null)

    const loadActivity = async () => {
      try {
        const result = await getParkingActivity(getActivityRange(period))
        if (isCurrent) setActivity(result)
      } catch (loadError) {
        if (!isCurrent) return
        setActivity([])
        setActivityError(getErrorMessage(loadError, 'Unable to load parking activity.'))
      } finally {
        if (isCurrent) setIsActivityLoading(false)
      }
    }

    void loadActivity()
    return () => {
      isCurrent = false
    }
  }, [period, retryKey])

  const data: AdminDashboardData | null = coreData
    ? { ...coreData, activity }
    : null

  return {
    data,
    isLoading,
    isActivityLoading,
    error,
    activityError,
  }
}

export const useStaffDashboardData = (retryKey: number) => {
  const [data, setData] = useState<StaffDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    const loadDashboard = async () => {
      try {
        const [summary, parkingAreas, recentActivities] = await Promise.all([
          getDashboardSummary(),
          getParkingAreaOccupancy(),
          getRecentActivities({ maxCount: 10 }),
        ])
        if (isCurrent) setData({ summary, parkingAreas, recentActivities })
      } catch (loadError) {
        if (!isCurrent) return
        setData(null)
        setError(getErrorMessage(loadError, 'Unable to load the staff dashboard.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      isCurrent = false
    }
  }, [retryKey])

  return { data, isLoading, error }
}
