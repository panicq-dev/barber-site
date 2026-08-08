import { AppProvider, useApp } from "./context/AppContext"
import Home from "./screens/Home"
import ClientInfo from "./screens/ClientInfo"
import BarberSelection from "./screens/BarberSelection"
import ProductSelection from "./screens/ProductSelection"
import ExtraProducts from "./screens/ExtraProducts"
import TimeSlotSelection from "./screens/TimeSlotSelection"
import Confirmation from "./screens/Confirmation"
import BookingSuccess from "./screens/BookingSuccess"
import AdminLogin from "./screens/AdminLogin"
import AdminRequests from "./screens/AdminRequests"
import AdminSchedule from "./screens/AdminSchedule"
import BarberSchedule from "./screens/BarberSchedule"

function Router() {
  const { currentScreen, navigate } = useApp()

  switch (currentScreen) {
    case "home":
      return <Home />
    case "client-info":
      return <ClientInfo />
    case "barber-selection":
      return <BarberSelection />
    case "product-selection":
      return <ProductSelection />
    case "extra-products":
      return <ExtraProducts />
    case "time-slot-selection":
      return <TimeSlotSelection />
    case "confirmation":
      return <Confirmation />
    case "booking-success":
      return <BookingSuccess />
    case "admin-login":
      return <AdminLogin />
    case "admin-requests":
      return <AdminRequests onTabChange={(t) => navigate(t === "schedule" ? "admin-schedule" : "admin-requests")} />
    case "admin-schedule":
      return <AdminSchedule onTabChange={(t) => navigate(t === "requests" ? "admin-requests" : "admin-schedule")} />
    case "barber-schedule":
      return <BarberSchedule />
    default:
      return <Home />
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
