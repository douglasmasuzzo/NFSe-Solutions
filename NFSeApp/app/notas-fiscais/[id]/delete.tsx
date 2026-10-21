import { useLocalSearchParams } from 'expo-router';
import { NotaFiscalDeleteScreen } from '@/features/notas-fiscais/screens/NotaFiscalDeleteScreen';

export default function NotaFiscalDeleteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NotaFiscalDeleteScreen id={id} />;
}
