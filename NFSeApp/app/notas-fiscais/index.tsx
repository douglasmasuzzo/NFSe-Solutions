import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { NotaFiscalListScreen } from '@/features/notas-fiscais/screens/NotaFiscalListScreen';

export default function NotasFiscaisIndexRoute() {
  return (
    <RequireAuth>
      <NotaFiscalListScreen />
    </RequireAuth>
  );
}
