import { ShieldAlert } from 'lucide-react'
import { EmptyState, Icon } from '@pqms/ui-library'
import { PageContainer, PageCrumb } from '@/app/chrome'

export function QirManagementScreen() {
  return (
    <PageContainer>
      <PageCrumb backTo="/dashboard" trail={[{ label: 'Kia PQMS', to: '/dashboard' }, { label: 'QIR Management' }]} />
      <EmptyState
        icon={<Icon icon={ShieldAlert} size={28} />}
        title="QIR Management"
        message="Quality Issue Report management is coming in a future release."
      />
    </PageContainer>
  )
}
