import { setActivePinia, createPinia } from 'pinia';
import { useHolidayStore } from '../src/stores/holiday';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Holiday Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('initializes with empty holidays and loading true', () => {
        const store = useHolidayStore();
        expect(store.holidays).toEqual([]);
        expect(store.loading).toBe(true);
    });

    it('sets up SignalR connection and handles messages', async () => {
        const mockConnection = {
            on: vi.fn(),
            start: vi.fn().mockResolvedValue(undefined),
        };
        HubConnectionBuilder.prototype.withUrl = vi.fn().mockReturnValue({
            build: vi.fn().mockReturnValue(mockConnection),
        });

        const store = useHolidayStore();
        store.setupSignalR();

        expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
        expect(mockConnection.start).toHaveBeenCalled();
    });

    it('sets up SignalR connection and handles messages', async () => {
        const mockConnection = {
            on: vi.fn(),
            start: vi.fn().mockResolvedValue(undefined),
        };
        HubConnectionBuilder.prototype.withUrl = vi.fn().mockReturnValue({
            build: vi.fn().mockReturnValue(mockConnection),
        });

        const store = useHolidayStore();
        store.setupSignalR();

        expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
        expect(mockConnection.start).toHaveBeenCalled();
    });

    it('fetches holidays with startDate and endDate correctly', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, name: 'New Year', startDate: '2024-01-01', endDate: '2024-01-07' }]),
            })
        ) as any;

        const store = useHolidayStore();
        await store.fetchHolidays();

        expect(store.holidays).toEqual([{ id: 1, holiday_name: 'New Year', holiday_date: '2024-01-01', end_date: '2024-01-07' }]);
    });

    it('calculates end date for holidays when not provided', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, name: 'New Year', startDate: '2024-01-01' }]),
            })
        ) as any;

        const store = useHolidayStore();
        await store.fetchHolidays();

        const expectedEndDate = new Date('2024-01-01');
        expectedEndDate.setDate(expectedEndDate.getDate() + 7);

        expect(store.holidays[0].end_date).toBe(expectedEndDate.toISOString());
    });

    it('calculates holiday duration correctly for one week period', () => {
        const store = useHolidayStore();
        const holiday = { id: 1, holiday_name: 'New Year', holiday_date: '2024-01-01', end_date: '2024-01-07' };
        const duration = store.calculateDuration(holiday);

        expect(duration).toBe(6);
    });

    it('calculates holiday duration correctly for different periods', () => {
        const store = useHolidayStore();

        const oneDay = { id: 1, holiday_name: 'Holiday', holiday_date: '2024-01-01', end_date: '2024-01-01' };
        expect(store.calculateDuration(oneDay)).toBe(0);

        const twoWeeks = { id: 2, holiday_name: 'Holiday', holiday_date: '2024-01-01', end_date: '2024-01-15' };
        expect(store.calculateDuration(twoWeeks)).toBe(14);
    });

    it('handles empty holidays list when fetching', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            })
        ) as any;

        const store = useHolidayStore();
        await store.fetchHolidays();

        expect(store.holidays).toEqual([]);
    });

    it('handles API errors without localStorage fallback', async () => {
        localStorage.removeItem('holidaysData');
        global.fetch = vi.fn(() => Promise.reject(new Error('Failed to fetch'))) as any;

        const store = useHolidayStore();
        await store.fetchHolidays();

        expect(store.holidays).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('updates holidays when receiving a break notification', async () => {
        let messageCallback: Function;
        const mockConnection = {
            on: vi.fn((event, callback) => {
                if (event === 'ReceiveMessage') messageCallback = callback;
            }),
            start: vi.fn().mockResolvedValue(undefined)
        };

        HubConnectionBuilder.prototype.withUrl = vi.fn().mockReturnValue({
            build: vi.fn().mockReturnValue(mockConnection)
        });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ id: 3, name: 'Updated Holiday', startDate: '2024-05-01', endDate: '2024-05-15' }])
        }) as any;

        const store = useHolidayStore();
        store.setupSignalR();

        messageCallback('Break');

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});