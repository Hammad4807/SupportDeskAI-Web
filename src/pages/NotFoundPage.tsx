import { Link } from 'react-router'
import { SearchX } from 'lucide-react'
import StateMessage from '../components/StateMessage.tsx'

export default function NotFoundPage() {
  return (
    <StateMessage
      icon={<SearchX size={32} />}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Link to="/tickets" className="btn btn--default">
          Go to tickets
        </Link>
      }
    />
  )
}
