import { FileText } from 'lucide-react'
import { EmptyState, Icon } from '@pqms/ui-library'
import { PageContainer, PageCrumb } from '@/app/chrome'

export function TsbManagementScreen() {
  return (
    <PageContainer>
      <PageCrumb backTo="/dashboard" trail={[{ label: 'Kia PQMS', to: '/dashboard' }, { label: 'TSB Management' }]} />
      <EmptyState
        icon={<Icon icon={FileText} size={28} />}
        title="TSB Management"
        message="Technical Service Bulletin management is coming in a future release."
      />
    </PageContainer>
  )
}
