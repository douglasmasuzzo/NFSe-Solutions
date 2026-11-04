import { useLocalSearchParams } from 'expo-router';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { NotaFiscalEditScreen } from '@/features/notas-fiscais/screens/NotaFiscalEditScreen';

export default function NotaFiscalEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequireAuth>
      <NotaFiscalEditScreen id={id} />
    </RequireAuth>
  );
}
