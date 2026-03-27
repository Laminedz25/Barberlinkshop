/**
 * BarberLink Level 3 Testing System 🧪📊
 * Unit Tests for Core Business Logic
 */

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

const calculateTotal = (selectedServices: string[], services: Service[]) => {
  return selectedServices.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);
};

const calculateDuration = (selectedServices: string[], services: Service[]) => {
  return selectedServices.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.duration_minutes || 0);
  }, 0);
};

describe('Booking System Logic', () => {
  const mockServices: Service[] = [
    { id: '1', name: 'Haircut', price: 1000, duration_minutes: 30 },
    { id: '2', name: 'Beard Trim', price: 500, duration_minutes: 15 },
    { id: '3', name: 'Wash & Style', price: 300, duration_minutes: 10 },
  ];

  test('should calculate total price for multiple services', () => {
    const selected = ['1', '2']; 
    const total = calculateTotal(selected, mockServices);
    expect(total).toBe(1500);
  });

  test('should calculate total duration for multiple services', () => {
    const selected = ['1', '2', '3'];
    const duration = calculateDuration(selected, mockServices);
    expect(duration).toBe(55);
  });

  test('should handle empty service selection', () => {
    const selected: string[] = [];
    const total = calculateTotal(selected, mockServices);
    expect(total).toBe(0);
  });
});
