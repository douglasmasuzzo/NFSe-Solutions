import { useLocalSearchParams } from 'expo-router';
import { NotaFiscalEditScreen } from '@/features/notas-fiscais/screens/NotaFiscalEditScreen';

export default function NotaFiscalEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NotaFiscalEditScreen id={id} />;
}
