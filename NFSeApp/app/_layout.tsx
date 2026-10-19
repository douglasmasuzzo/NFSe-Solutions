import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'NFSe Solutions' }} />
        <Stack.Screen name="notas-fiscais/index" options={{ title: 'Notas Fiscais' }} />
        <Stack.Screen name="notas-fiscais/new" options={{ title: 'Nova Nota Fiscal' }} />
        <Stack.Screen name="notas-fiscais/[id]/edit" options={{ title: 'Editar Nota Fiscal' }} />
        <Stack.Screen
          name="notas-fiscais/[id]/delete"
          options={{ title: 'Excluir Nota Fiscal', presentation: 'modal' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
