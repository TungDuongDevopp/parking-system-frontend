import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  IconAlertCircle,
  IconArrowRight,
  IconBook2,
  IconCalendarCheck,
  IconCar,
  IconChevronRight,
  IconCreditCard,
  IconInfoCircle,
  IconMapPin,
  IconSearch,
  IconShieldCheck,
  IconUserCircle,
} from '@tabler/icons-react'
import Header from '../components/homePage/Header'
import Footer from '../components/homePage/Footer'
import '../resources/css/homepage.scss'
import '../resources/css/customer-guide.scss'

const guideCategories = [
  {
    id: 'get-started',
    title: 'Get Started',
    description: 'Learn the basics of accessing your ParkingSystem account.',
    icon: IconBook2,
    topics: ['Register an account', 'Sign in and sign out', 'Change password'],
    intro: 'Create your account and learn how to access it securely.',
    steps: [
      { title: 'Create an account', text: 'Choose Sign up from the main navigation and complete the registration form.' },
      { title: 'Sign in', text: 'Use your registered credentials on the Sign in page. Use the account menu to log out when finished.' },
      { title: 'Change your password', text: 'While signed in, open Change password from the account menu and follow the form instructions.' },
    ],
    note: 'Password recovery is not available in the current customer portal. If you cannot access your account, contact your system administrator.',
    link: { to: '/register', label: 'Create an account' },
  },
  {
    id: 'subscriptions',
    title: 'Subscription & Payments',
    description: 'Browse plans, purchase a parking subscription, and check its status.',
    icon: IconCreditCard,
    topics: ['Browse available plans', 'Purchase a subscription', 'Subscription status and expiration', 'Payment status'],
    intro: 'Choose an available plan and keep track of its active period from your account.',
    steps: [
      { title: 'Browse plans', text: 'Open Pricing and choose the vehicle type to see the available plans.' },
      { title: 'Purchase a plan', text: 'Select a plan, enter its required vehicle plate number or numbers, choose a start time, and submit the purchase.' },
      { title: 'Check the subscription', text: 'Open My Subscriptions to review the plan, start and end times, price, and current status.' },
      { title: 'Understand the status', text: 'Subscriptions are shown as Pending, In Use, Expired, or Canceled. Refresh the list to load the latest server status.' },
    ],
    note: 'The customer portal does not currently provide a subscription renewal action or transaction-history page. To continue after expiry, choose an available plan again.',
    link: { to: '/pricing', label: 'Browse pricing' },
  },
  {
    id: 'reservations',
    title: 'Parking Reservations',
    description: 'Find parking areas, check availability, and manage your reservations.',
    icon: IconCalendarCheck,
    topics: ['Browse parking areas', 'Vehicle types and availability', 'Select a parking spot', 'Create and cancel reservations', 'Reservation status and expiration'],
    intro: 'Reservations are bookings for a parking area or an individual available spot; they are separate from an active parking session.',
    steps: [
      { title: 'Find a suitable area', text: 'Open Find Parking. Search by area name or code, and filter by vehicle type. The list shows available capacity.' },
      { title: 'Choose a spot when offered', text: 'For Individual Spot areas, open View Spots and select a spot marked Available. Capacity Based areas do not require a specific spot.' },
      { title: 'Choose a time and reserve', text: 'Reservations can be made for a future time today. Confirm the reservation before that time passes.' },
      { title: 'Review or cancel', text: 'Open My Reservations to see details and status. A reservation can be canceled while its status is Reserved.' },
    ],
    note: 'If no future time remains today, wait until another day to make a reservation. Expired reservations remain visible in reservation history with their status.',
    link: { to: '/customer/find-parking', label: 'Find parking' },
  },
  {
    id: 'parking-sessions',
    title: 'Parking Sessions',
    description: 'Understand how reservations differ from check-in and check-out sessions.',
    icon: IconCar,
    topics: ['Reservation versus session', 'Check-in and check-out', 'Parking duration and fees', 'Session status'],
    intro: 'A reservation records a planned arrival. A parking session records the actual parking activity and is distinct from the reservation.',
    steps: [
      { title: 'Arrive with your reservation', text: 'Show your reservation details to parking staff when you arrive.' },
      { title: 'Staff records the session', text: 'Check-in and check-out are handled by parking staff in the current system.' },
      { title: 'Ask staff about session details', text: 'The customer portal does not currently include a parking-session history screen. Staff can help verify session times, fees, or status.' },
    ],
    note: 'Do not treat a reservation as proof that a parking session has started. Session records are created and updated separately.',
    link: { to: '/customer/reservations', label: 'View reservations' },
  },
  {
    id: 'account',
    title: 'Account Management',
    description: 'Review and update your personal profile information.',
    icon: IconUserCircle,
    topics: ['View your profile', 'Update name, email, and phone number', 'Account settings', 'Change password'],
    intro: 'Keep your customer contact details up to date from your profile.',
    steps: [
      { title: 'Open your profile', text: 'Use the account menu and select My Profile.' },
      { title: 'Edit your details', text: 'Choose Edit profile to update your name, email address, or phone number, then save your changes.' },
      { title: 'Change your password', text: 'Use Change password from the account menu to update your sign-in password.' },
    ],
    link: { to: '/customer/profile', label: 'Open your profile' },
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Simple steps to help keep your account and information safe.',
    icon: IconShieldCheck,
    topics: ['Create a strong password', 'Keep credentials private', 'Sign out on shared devices', 'Protect personal information'],
    intro: 'A few basic habits can help protect access to your account.',
    steps: [
      { title: 'Use a strong password', text: 'Choose a unique password that is difficult to guess and avoid reusing passwords from other services.' },
      { title: 'Keep your credentials private', text: 'Do not share your password or leave it saved on a device other people use.' },
      { title: 'Sign out on shared devices', text: 'Use Logout from the account menu when you finish on a public or shared device.' },
      { title: 'Keep profile details accurate', text: 'Only provide information needed for your account and update it from My Profile when it changes.' },
    ],
    link: { to: '/change-password', label: 'Change password' },
  },
] as const

const frequentlyAskedQuestions = [
  {
    question: 'Why can’t I sign in?',
    answer: 'Check that you are using the credentials for your registered account. Password recovery is not currently offered in the portal; contact your system administrator if you still cannot sign in.',
  },
  {
    question: 'Why did my reservation fail?',
    answer: 'Check that the area supports your selected vehicle type, a spot or capacity is available, and the selected time is still in the future today. The system only accepts reservations for today.',
  },
  {
    question: 'What happens when a reservation expires?',
    answer: 'Its status is shown as Expired in My Reservations. You can review the reservation details, then create a new reservation if a suitable area is available.',
  },
  {
    question: 'Why hasn’t my subscription status updated?',
    answer: 'Refresh My Subscriptions to fetch the latest status. The portal shows the status returned by the system; it does not display transaction history.',
  },
  {
    question: 'What should I do if a payment fails?',
    answer: 'Check My Subscriptions for the latest subscription status. If it remains Pending or does not reflect the payment result after refreshing, contact your system administrator with the subscription details.',
  },
]

const CustomerUserGuide = () => {
  const { categoryId } = useParams()
  const [search, setSearch] = useState('')
  const category = guideCategories.find((item) => item.id === categoryId)
  const normalizedSearch = search.trim().toLocaleLowerCase()

  const visibleCategories = useMemo(() => guideCategories.filter((item) => {
    if (!normalizedSearch) return true
    const searchableContent = [
      item.title,
      item.description,
      item.intro,
      ...item.topics,
      ...item.steps.flatMap((step) => [step.title, step.text]),
    ].join(' ').toLocaleLowerCase()
    return searchableContent.includes(normalizedSearch)
  }), [normalizedSearch])

  return (
    <div className="homepage customer-guide-shell">
      <Header />
      <main className="homepage-main customer-guide-page">
        <div className="customer-guide-container">
          {category ? (
            <article className="customer-guide-article">
              <nav className="customer-guide-breadcrumb" aria-label="Breadcrumb">
                <Link to="/customer/guide">User Guide</Link>
                <IconChevronRight size={15} aria-hidden="true" />
                <span aria-current="page">{category.title}</span>
              </nav>
              <header className="customer-guide-article-heading">
                <span className="customer-guide-icon"><category.icon size={23} stroke={1.8} aria-hidden="true" /></span>
                <div>
                  <p className="customer-guide-eyebrow">CUSTOMER GUIDE</p>
                  <h1>{category.title}</h1>
                  <p>{category.intro}</p>
                </div>
              </header>
              <ol className="customer-guide-steps">
                {category.steps.map((step) => (
                  <li key={step.title}>
                    <span className="customer-guide-step-number" aria-hidden="true" />
                    <div>
                      <h2>{step.title}</h2>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {'note' in category && category.note && (
                <aside className={`customer-guide-callout ${category.id === 'get-started' || category.id === 'parking-sessions' ? 'is-warning' : ''}`}>
                  {category.id === 'get-started' || category.id === 'parking-sessions'
                    ? <IconAlertCircle size={19} aria-hidden="true" />
                    : <IconInfoCircle size={19} aria-hidden="true" />}
                  <p>{category.note}</p>
                </aside>
              )}
              <div className="customer-guide-article-actions">
                <Link className="customer-guide-back" to="/customer/guide">Back to all guides</Link>
                <Link className="customer-guide-action" to={category.link.to}>
                  {category.link.label}<IconArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ) : (
            <>
              <header className="customer-guide-hero">
                <span className="customer-guide-eyebrow">CUSTOMER HELP CENTER</span>
                <h1>User Guide</h1>
                <p className="customer-guide-subtitle">Everything you need to know to use ParkingSystem.</p>
                <p className="customer-guide-welcome">Welcome! Browse a topic or search for the steps you need.</p>
                <div className="customer-guide-hero-mark" aria-hidden="true">
                  <IconMapPin size={22} />
                  <span>P</span>
                </div>
              </header>
              <label className="customer-guide-search">
                <IconSearch size={20} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search guides, topics, or keywords..."
                  aria-label="Search guides, topics, or keywords"
                />
              </label>

              {visibleCategories.length > 0 ? (
                <section className="customer-guide-grid" aria-label="Guide categories">
                  {visibleCategories.map((item) => {
                    const CategoryIcon = item.icon
                    return (
                      <Link className="customer-guide-card" to={`/customer/guide/${item.id}`} key={item.id}>
                        <span className="customer-guide-icon"><CategoryIcon size={22} stroke={1.8} aria-hidden="true" /></span>
                        <h2>{item.title}<IconChevronRight size={18} aria-hidden="true" /></h2>
                        <p>{item.description}</p>
                        <ul>
                          {item.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                        <span className="customer-guide-browse">Browse guide<IconArrowRight size={16} aria-hidden="true" /></span>
                      </Link>
                    )
                  })}
                </section>
              ) : (
                <p className="customer-guide-no-results" role="status">No guides match “{search}”. Try another keyword.</p>
              )}

              <section className="customer-guide-faq" aria-labelledby="customer-guide-faq-title">
                <div className="customer-guide-faq-heading">
                  <span className="customer-guide-eyebrow">NEED A QUICK ANSWER?</span>
                  <h2 id="customer-guide-faq-title">Frequently asked questions</h2>
                </div>
                <div className="customer-guide-faq-list">
                  {frequentlyAskedQuestions.map((faq) => (
                    <details key={faq.question}>
                      <summary>{faq.question}<IconChevronRight size={17} aria-hidden="true" /></summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CustomerUserGuide
