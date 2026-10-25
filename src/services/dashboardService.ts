import { apiClient } from './apiClient'
import { readAbpResult } from './serviceResponse'
import type {
  DashboardSummaryDto,
  GetParkingActivityInput,
  GetRecentActivitiesInput,
  ParkingActivityDto,
  ParkingAreaOccupancyDto,
  RecentActivityDto,
} from '../types/Dashboard/dashboard'

const serializeActivityInput = (input: GetParkingActivityInput) => {
  const query = new URLSearchParams({
    FromDate: input.fromDate,
    ToDate: input.toDate,
    GroupBy: (input.groupBy ?? 1).toString(),
  })
  return query.toString()
}

export const getDashboardSummary = async (): Promise<DashboardSummaryDto> => {
  const response = await apiClient('/api/services/app/Dashboard/GetDashboardSummary', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Unable to load dashboard summary.')
}

export const getParkingActivity = async (
  input: GetParkingActivityInput,
): Promise<ParkingActivityDto[]> => {
  const query = serializeActivityInput(input)
  const response = await apiClient(`/api/services/app/Dashboard/GetParkingActivity?${query}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Unable to load parking activity.')
}

export const getParkingAreaOccupancy = async (): Promise<ParkingAreaOccupancyDto[]> => {
  const response = await apiClient('/api/services/app/Dashboard/GetParkingAreaOccupancy', {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Unable to load parking area occupancy.')
}

export const getRecentActivities = async (
  input: GetRecentActivitiesInput = {},
): Promise<RecentActivityDto[]> => {
  const query = new URLSearchParams({
    MaxCount: (input.maxCount ?? 10).toString(),
  })
  const response = await apiClient(`/api/services/app/Dashboard/GetRecentActivities?${query}`, {
    method: 'GET',
    authenticated: true,
  })
  return readAbpResult(response, 'Unable to load recent parking activities.')
}
