import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNewsStore } from '@/stores/news';
import { createPinia, setActivePinia } from 'pinia';
import { CapacitorHttp } from '@capacitor/core';
import { HubConnectionBuilder } from '@microsoft/signalr';

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

describe('News Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('loads news from localStorage if data exists', () => {
        const store = useNewsStore();
        const mockNews = [{id: 1, title: 'News 1', date: '2023-12-25'}];
        const mockLastUpdated = Date.now();

        localStorage.setItem('newsData', JSON.stringify(mockNews));
        localStorage.setItem('newsLastUpdated', mockLastUpdated.toString());

        const result = store.initialize();

        expect(store.news).toEqual(mockNews);
        expect(store.lastUpdated).toBe(mockLastUpdated);
    });

    it('returns empty array if localStorage data is invalid', () => {
        const store = useNewsStore();
        localStorage.setItem('newsData', 'invalid json');

        const result = store.initialize();

        expect(store.news).toEqual([]);
        expect(store.lastUpdated).toBe(0);
    });

    it('fetches news and updates the store on success', async () => {
        const store = useNewsStore();
        const mockResponse = {
            status: 200,
            data: [{id: 1, title: 'News 1', date: '2023-12-25'}],
        };
        CapacitorHttp.get.mockResolvedValue(mockResponse);

        const result = await store.fetchNews();

        expect(result).toBe(true);
        expect(store.news).toEqual(mockResponse.data);
    });

    it('does not update the store if fetched news is identical to current news', async () => {
        const store = useNewsStore();
        const mockNews = [{id: 1, title: 'News 1', date: '2023-12-25'}];
        store.news = mockNews;

        const mockResponse = {
            status: 200,
            data: mockNews,
        };
        CapacitorHttp.get.mockResolvedValue(mockResponse);

        const result = await store.fetchNews();

        expect(result).toBe(false);
        expect(store.news).toEqual(mockNews);
    });

    it('handles fetch failure gracefully', async () => {
        const store = useNewsStore();
        CapacitorHttp.get.mockRejectedValue(new Error('Network error'));

        const result = await store.fetchNews();

        expect(result).toBe(false);
        expect(store.news).toEqual([]);
    });

    it('sets up SignalR connection and listens for messages', async () => {
        const store = useNewsStore();
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

