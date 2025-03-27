import { setActivePinia, createPinia } from 'pinia';
import { useNewsStore } from '../src/stores/news';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {HubConnectionBuilder} from "@microsoft/signalr";

describe('News Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('initializes with empty news and loading false', () => {
        const store = useNewsStore();
        expect(store.news).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('sets up SignalR connection and handles messages', async () => {
        const mockConnection = {
            on: vi.fn(),
            start: vi.fn().mockResolvedValue(undefined),
        };
        HubConnectionBuilder.prototype.withUrl = vi.fn().mockReturnValue({
            build: vi.fn().mockReturnValue(mockConnection),
        });

        const store = useNewsStore();
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

        const store = useNewsStore();
        store.setupSignalR();

        expect(mockConnection.on).toHaveBeenCalledWith('ReceiveMessage', expect.any(Function));
        expect(mockConnection.start).toHaveBeenCalled();
    });



    it('fetches news and updates the store', async () => {
        const store = useNewsStore();
        const mockNews = [
            { id: 1, title: 'Title 1', content: 'Description 1', date: '2023-01-01', image: 'url1' },
            { id: 2, title: 'Title 2', content: 'Description 2', date: '2023-01-02', image: 'url2' }
        ];

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => mockNews
            } as Response)
        );

        await store.fetchNews();

        expect(store.news).toEqual(mockNews);
        expect(store.loading).toBe(false);
    });

    it('uses cached news if available', async () => {
        const store = useNewsStore();
        const cachedNews = [
            { id: 1, title: 'Cached Title 1', content: 'Cached Description 1', date: '2023-01-01', image: 'cached_url1' }
        ];
        localStorage.setItem('newsData', JSON.stringify(cachedNews));

        // Mock the fetch function to simulate an API failure
        global.fetch = vi.fn(() => Promise.reject(new Error('Fetch error')));

        await store.fetchNews();

        // Verify that the store uses the cached news
        expect(store.news).toEqual(cachedNews);
        expect(store.loading).toBe(false);
    });

    it('handles fetch error and uses cached news if available', async () => {
        const store = useNewsStore();
        const cachedNews = [
            { id: 1, title: 'Cached Title 1', content: 'Cached Description 1', date: '2023-01-01', image: 'cached_url1' }
        ];
        localStorage.setItem('newsData', JSON.stringify(cachedNews));

        global.fetch = vi.fn(() => Promise.reject(new Error('Fetch error')));

        await store.fetchNews();

        expect(store.news).toEqual(cachedNews);
        expect(store.loading).toBe(false);
    });

    it('handles fetch error and no cached news available', async () => {
        const store = useNewsStore();

        global.fetch = vi.fn(() => Promise.reject(new Error('Fetch error')));

        await store.fetchNews();

        expect(store.news).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('saves news to localStorage after fetching', async () => {
        const store = useNewsStore();
        const mockNews = [
            { id: 1, title: 'Title 1', content: 'Description 1', date: '2023-01-01', image: 'url1' },
            { id: 2, title: 'Title 2', content: 'Description 2', date: '2023-01-02', image: 'url2' }
        ];

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => mockNews
            } as Response)
        );

        await store.fetchNews();

        const savedNews = JSON.parse(localStorage.getItem('newsData') || '[]');
        expect(savedNews).toEqual(mockNews);
    });
});