import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListRideRequests } from '@workspace/api-client-react';

const queryClient = new QueryClient();

function Overview() {
  const query = useListRideRequests({ role: 'captain' });
  
  return (
    <div className="mx-auto max-w-[1440px] ops-fade-in p-8">
      <h1 className="text-3xl font-extrabold mb-8">Massar Operations Dashboard</h1>
      
      <div className="ops-panel rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Ride Requests</h2>
        
        {query.isLoading && <p>Loading requests...</p>}
        {query.isError && <p>Error loading requests</p>}
        
        {query.data && query.data.length === 0 && <p>No recent ride requests.</p>}
        
        {query.data && query.data.length > 0 && (
          <div className="divide-y divide-[hsl(var(--border))]">
            {query.data.map((request: any) => (
              <div key={request.id} className="py-4">
                <p className="font-bold">Route: {request.routeId}</p>
                <p className="text-sm text-gray-500">Status: {request.status}</p>
                <p className="text-sm text-gray-500">Seats Requested: {request.seatsRequested}</p>
                <p className="text-sm text-gray-500">Estimated Fare: {request.estimatedFare} JOD</p>
                <p className="text-sm text-gray-500">Requested At: {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Overview />
    </QueryClientProvider>
  );
}

export default App;