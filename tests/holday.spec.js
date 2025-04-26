import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHolidayStore } from '@/stores/holiday';
import { CapacitorHttp } from '@capacitor/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        get: vi.fn(),
    },
}));

vi.mock('@microsoft/signalr', () => ({
    HubConnectionBuilder: vi.fn().mockImplementation(() => ({
        withUrl: vi.fn().mockReturnThis(),
        build: vi.fn().mockReturnValue({
            on: vi.fn(),
            start: vi.fn().mockResolvedValue(undefined),
        }),
    })),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Holiday Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('fetches holidays and updates the store on success', async () => {
        const mockResponse = {
            status: 200,
            data: [
                { id: 1, name: 'Holiday 1', startDate: '2023-12-25', endDate: '2023-12-31' },
            ],
        };
        CapacitorHttp.get.mockResolvedValue(mockResponse);

        const store = useHolidayStore();
        await store.fetchHolidays();

        expect(store.holidays).toHaveLength(1);
        expect(store.holidays[0]).toEqual({
            id: 1,
            holiday_name: 'Holiday 1',
            holiday_date: '2023-12-25',
            end_date: '2023-12-31',
        });
        expect(store.loading).toBe(false);
    });

    it('handles fetch failure and loads holidays from localStorage', async () => {
        const storedHolidays = [
            { id: 2, holiday_name: 'Stored Holiday', holiday_date: '2023-11-01', end_date: '2023-11-07' },
        ];
        localStorage.setItem('holidaysData', JSON.stringify(storedHolidays));
        CapacitorHttp.get.mockRejectedValue(new Error('Network error'));

        const store = useHolidayStore();
        await store.fetchHolidays();

        expect(store.holidays).toEqual(storedHolidays);
        expect(store.loading).toBe(false);
    });

    it('calculates the correct countdown for a holiday', () => {
        const store = useHolidayStore();
        const holidayDate = new Date();
        holidayDate.setDate(holidayDate.getDate() + 5);

        const result = store.calculateTimeLeft(holidayDate.toISOString());
        expect(result.days).toBe(5);
    });

    it('calculates the correct progress percentage', () => {
        const store = useHolidayStore();
        const holidayDate = new Date();
        holidayDate.setDate(holidayDate.getDate() + 10);

        const result = store.calculateProgress(holidayDate.toISOString());
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(100);
    });

    it('calculates the correct duration of a holiday', () => {
        const store = useHolidayStore();
        const holiday = {
            id: 1,
            holiday_name: 'Test Holiday',
            holiday_date: '2023-12-25',
            end_date: '2023-12-31',
        };

        const result = store.calculateDuration(holiday);
        expect(result).toBe(7);
    });

    it('sets up SignalR connection and listens for messages', async () => {
        const store = useHolidayStore();
        const mockConnection = {
            on: vi.fn(),
            start: vi.fn().mockResolvedValue(undefined),
        };
        HubConnectionBuilder.mockImplementation(() => ({
            withUrl: vi.fn().mockReturnThis(),
            build: vi.fn().mockReturnValue(mockConnection),
        }));

        store.setupSignalR();

        expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
        expect(mockConnection.start).toHaveBeenCalled();
    });


});