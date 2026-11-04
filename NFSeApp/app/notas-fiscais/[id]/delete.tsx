import { useLocalSearchParams } from 'expo-router';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { NotaFiscalDeleteScreen } from '@/features/notas-fiscais/screens/NotaFiscalDeleteScreen';

export default function NotaFiscalDeleteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequireAuth>
      <NotaFiscalDeleteScreen id={id} />
    </RequireAuth>
  );
}
