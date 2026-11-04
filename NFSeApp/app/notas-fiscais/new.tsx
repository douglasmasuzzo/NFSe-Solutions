import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { NotaFiscalCreateScreen } from '@/features/notas-fiscais/screens/NotaFiscalCreateScreen';

export default function NotaFiscalNewRoute() {
  return (
    <RequireAuth>
      <NotaFiscalCreateScreen />
    </RequireAuth>
  );
}
