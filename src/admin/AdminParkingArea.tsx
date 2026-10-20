import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/sidebar/Sidebar'
import '../resources/css/dashboard.scss'
import {getParkingAreas,
    createParkingArea,
    updateParkingArea,
    deleteParkingArea,
    changeParkingAreaStatus
 } from '../services/parkingAreaService'
import { mapAbpFieldErrors, mapMessageToFieldErrors, type FieldErrors } from '../services/fieldValidation'
import { getAbpErrorFromException } from '../services/serviceResponse'
import type { ParkingAreaQuery } from '../types/ParkingArea/parkingAreaQuery'
import type { ParkingAreaDto } from '../types/ParkingArea/parkingArea'
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

type ParkingAreaFilters = Pick<
ParkingAreaQuery,
'status' | 'vehicleType' | 'minCapacity' | 'maxCapacity' | 'parkingMode'
>

type FilterDraft = Omit<ParkingAreaFilters, 'status'> & { status: string }
type ParkingAreaFilterField = 'maxCapacity'
const vehicleTypes = [
  {value:1, label:'Bicycle'},
  {value:2, label:'ElectricBicycle'},
  {value:3, label:'Motorcycle'},
  {value:4, label:'ElectricMotorcycle'},
  {value:5, label:'Car'}
]
const parkingAreaStatuses =[
  { value: 0, label: 'Inactive' },
  { value: 1, label: 'Active' },
]


const parkingAreaModes =[
   { value: 0, label: 'IndividualSpot' },
  { value: 1, label: 'CapacityBase' },
]
const AdminParkingArea = () =>{
  const [parkingAreas,setParkingAreas] = useState<ParkingAreaDto[]>([])
  const [isLoading,setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  return (
    <div className="workspace roles-workspace">
       <Sidebar />
      <main className="main-content roles-content">
        <header className="roles-header">
              <div>
                <span className="eyebrow-label">Administration</span>
                <h1>Parking Area</h1>
              </div>
            <button className="primary-action" type="button" onClick={() => alert('Bạn đã ấn thêm')}>
              <IconPlus className="action-icon" aria-hidden="true" />
              <span>Create parking area</span>
            </button>
        </header>
        <section className="roles-card" aria-label="ParkingArea list">
          <div className="roles-toolbar staff-toolbar">
            <label className="roles-search">
              <span aria-hidden="true"><IconSearch className="action-icon" /></span>
               <input
                type="search"
                placeholder="Search parkingArea"
                aria-label="Search parkingArea"
              />
            </label>
            <div className="parkingArea-filter-wrap">
              <button
              type="button"
                aria-label="Open parkingArea filters"
                aria-controls="parkingArea-filter-popover"
                onClick={()=>alert('bạn đã nhấn lọc')}
              >
                <IconAdjustmentsHorizontal className="action-icon" aria-hidden="true" />
                <span>Filters</span>
              </button>
            </div>
          </div>
          <div className="roles-table-wrap">
            <table className="roles-table parkingAreas-table">
                  <thead>
                    <tr>
                      <th>ParkingCode</th>
                      <th>Name</th>
                      <th>VehicleType</th>
                      <th>Capacity</th>
                      <th>Current Occupancy</th>
                      <th>ParkingMode</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && parkingAreas.map((area)=> (
                      <tr key={area.id}>
                          <td>{area.parkingCode}</td>
                          <td>{area.name}</td>
                          <td>{area.vehicleTypeName}</td>
                          <td>{area.capacity}</td>
                          <td>{area.currentOccupancy}</td>
                          <td>{area.parkingModeName}</td>
                          <td>{area.location}</td>
                          <td>{area.parkingAreaStatusName}</td>
                          <td>
                              <div className="role-actions">
                                <button className="edit-action" type="button" onClick={() =>alert('Bạn đã bấm sửa')}>
                                    <IconPencil className="action-icon" aria-hidden="true" />
                                     Edit
                                </button>
                                <button
                                  className="delete-action"
                                  type="button"
                                  onClick={() => alert('Bạn đã bấm xóa')}>
                                  <IconTrash className="action-icon" aria-hidden="true" />
                                </button>
                              </div>
                          </td>
                      </tr>




                    ))}
                  </tbody>
            </table>
             {!isLoading && !errorMessage && parkingAreas.length === 0 && (
              <p className="empty-roles">No areas found.</p>
            )}
          </div>
          <footer className="roles-footer">
             <button
              className="refresh-action"
              type="button"
              aria-label="Refresh staff"
              onClick={() => alert('Bạn đã nhấn load areas')}
              disabled={isLoading}
            >
              <IconRefresh className="action-icon" aria-hidden="true" />
            </button>
             <span>Số trang</span>
             <label>Show
              <select aria-label="Rows per page">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              entries
             </label>
             <div className="pagination">
              <button type="button" aria-label="First page" onClick={() => alert('trang đầu')}>
                <IconChevronsLeft className="action-icon" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Previous page" onClick={() => alert('trang tiếp')}>
                <IconChevronRight className="action-icon" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Last page" onClick={() => alert('trang cuối')} >
                <IconChevronsRight className="action-icon" aria-hidden="true" />
              </button>
             </div>
          </footer>
        </section>
      </main>
    </div>
  )
}
export default AdminParkingArea;