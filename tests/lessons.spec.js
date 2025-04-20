import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLessonStore } from '@/stores/lessons';
import { createPinia, setActivePinia } from 'pinia';
import { CapacitorHttp } from '@capacitor/core';

vi.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        get: vi.fn(),
    },
}));

describe('Lesson Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('loads lessons from localStorage if data exists', () => {
        const store = useLessonStore();
        const mockLessons = { "2023.12.25": [{ id: 1, subjectName: "Math" }] };
        const mockLastUpdate = "2023-12-25T10:00:00.000Z";

        localStorage.setItem('lessonsByDay', JSON.stringify(mockLessons));
        localStorage.setItem('lessonsLastUpdate', mockLastUpdate);

        const result = store.loadFromLocalStorage();

        expect(result).toBe(true);
        expect(store.lessonsByDay).toEqual(mockLessons);
        expect(store.lastUpdate).toEqual(new Date(mockLastUpdate));
    });

    it('returns false and clears invalid localStorage data', () => {
        const store = useLessonStore();
        localStorage.setItem('lessonsByDay', "invalid json");

        const result = store.loadFromLocalStorage();

        expect(result).toBe(false);
        expect(localStorage.getItem('lessonsByDay')).toBeNull();
        expect(localStorage.getItem('lessonsLastUpdate')).toBeNull();
    });

    it('formats date strings correctly', () => {
        const store = useLessonStore();
        const result = store.formatDate("2023-12-25T10:00:00.000Z");

        expect(result).toBe("2023.12.25");
    });

    it('formats time strings correctly', () => {
        const store = useLessonStore();
        const result = store.formatTime("2023-12-25T10:00:00");

        expect(result).toBe("10:00");
    });

    it('processes lesson data and adds breaks correctly', () => {
        const store = useLessonStore();
        const mockData = [
            { id: 1, startTime: "2023-12-25T10:00:00", subjectName: "Math" },
            { id: 2, startTime: "2023-12-25T11:00:00", subjectName: "Science" },
        ];

        const result = store.processLessonData(mockData, "2023-12-25", "2023-12-25");

        expect(result["2023.12.25"]).toHaveLength(3);
        expect(result["2023.12.25"][1].isBreak).toBe(true);
        expect(result["2023.12.25"][1].name).toContain("Szünet");
    });

    it('fetches lessons and updates the store on success', async () => {
        const store = useLessonStore();
        const mockResponse = {
            status: 200,
            data: [
                { id: 1, startTime: "2023-12-25T10:00:00.000Z", subjectName: "Math" },
            ],
        };
        CapacitorHttp.get.mockResolvedValue(mockResponse);

        const result = await store.fetchLessons("2023-12-25", "2023-12-25");

        expect(result).toBe(true);
        expect(store.lessonsByDay["2023.12.25"]).toHaveLength(1);
    });

    it('handles fetch failure gracefully', async () => {
        const store = useLessonStore();
        CapacitorHttp.get.mockRejectedValue(new Error("Network error"));

        const result = await store.fetchLessons("2023-12-25", "2023-12-25");

        expect(result).toBe(false);
        expect(store.lessonsByDay).toEqual({});
    });

    it('removes lessons for the specified date range on 404 response', async () => {
        const store = useLessonStore();
        store.lessonsByDay = {
            "2023.12.25": [{ id: 1, subjectName: "Math" }],
            "2023.12.26": [{ id: 2, subjectName: "Science" }],
        };
        CapacitorHttp.get.mockResolvedValue({ status: 404 });

        const result = await store.fetchLessons("2023-12-25", "2023-12-26");

        expect(result).toBe(true);
        expect(store.lessonsByDay).toEqual({});
    });
});