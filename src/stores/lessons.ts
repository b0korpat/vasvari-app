import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from "@/stores/user";

export const useLessonStore = defineStore('lessonStore', () => {
    const lessonsByDay = ref<Record<string, any[]>>({});
    const loading = ref(false);
    const backgroundLoading = ref(false);
    const lastUpdate = ref<Date | null>(null);

    const dateFormatCache = new Map<string, string>();
    const timeFormatCache = new Map<string, string>();

    const saveToLocalStorage = () => {
        const lessonsToSave = JSON.stringify(lessonsByDay.value);
        if (localStorage.getItem('lessonsByDay') !== lessonsToSave) {
            localStorage.setItem('lessonsByDay', lessonsToSave);
            const now = new Date().toISOString();
            localStorage.setItem('lessonsLastUpdate', now);
            lastUpdate.value = new Date(now);
        }
    };

    const loadFromLocalStorage = () => {
        const savedLessons = localStorage.getItem('lessonsByDay');
        const savedLastUpdate = localStorage.getItem('lessonsLastUpdate');

        if (savedLessons) {
            try {
                lessonsByDay.value = JSON.parse(savedLessons);
                if (savedLastUpdate) {
                    lastUpdate.value = new Date(savedLastUpdate);
                }
                return true;
            } catch (e) {
                console.error('Failed to parse saved lessons', e);
                localStorage.removeItem('lessonsByDay');
                localStorage.removeItem('lessonsLastUpdate');
                return false;
            }
        }
        return false;
    };

    const formatDate = (dateString: string) => {
        if (dateFormatCache.has(dateString)) {
            return dateFormatCache.get(dateString)!;
        }
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formatted = `${year}.${month}.${day}`;
        dateFormatCache.set(dateString, formatted);
        return formatted;
    };

    const formatTime = (dateString: string) => {
        if (timeFormatCache.has(dateString)) {
            return timeFormatCache.get(dateString)!;
        }
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const formatted = `${hours}:${minutes}`;
        timeFormatCache.set(dateString, formatted);
        return formatted;
    };

    const processLessonData = (data: any[], startDate: string, endDate: string) => {
        const updatedLessons: Record<string, any[]> = { ...lessonsByDay.value };

        Object.keys(updatedLessons).forEach(dateStr => {
            const [year, month, day] = dateStr.split('.');
            const lessonDate = new Date(`${year}-${month}-${day}`);
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            if (lessonDate >= startDateObj && lessonDate <= endDateObj) {
                delete updatedLessons[dateStr];
            }
        });

        const newLessons: Record<string, any[]> = {};
        data.forEach(lesson => {
            const day = formatDate(lesson.startTime);
            if (!newLessons[day]) {
                newLessons[day] = [];
            }

            const startTime = new Date(lesson.startTime);
            const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);

            newLessons[day].push({
                id: lesson.id,
                subjectName: lesson.subjectName,
                displayName: lesson.subjectShortName || lesson.subjectName,
                room: lesson.classRoomName || 'No room',
                shortroom: lesson.classRoomShortName || 'No room',
                teachername: lesson.teacher,
                date: lesson.startTime.split('T')[0],
                studentGroupName: lesson.studentGroupName,
                starttime: formatTime(lesson.startTime),
                endtime: formatTime(endTime.toISOString()),
                isBreak: false
            });
        });

        Object.entries(newLessons).forEach(([day, lessons]) => {
            lessons.sort((a, b) => a.starttime.localeCompare(b.starttime));
            const lessonsWithBreaks: any[] = [];

            lessons.forEach((currentLesson, i) => {
                lessonsWithBreaks.push(currentLesson);

                if (i < lessons.length - 1) {
                    const nextLesson = lessons[i + 1];
                    const currentEnd = currentLesson.endtime.split(':').map(Number);
                    const nextStart = nextLesson.starttime.split(':').map(Number);

                    const currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
                    const nextStartMinutes = nextStart[0] * 60 + nextStart[1];
                    const gapMinutes = nextStartMinutes - currentEndMinutes;

                    if (gapMinutes > 30) {
                        lessonsWithBreaks.push({
                            id: `gap-${currentLesson.id}-${nextLesson.id}`,
                            name: 'Lyukasóra',
                            starttime: currentLesson.endtime,
                            endtime: nextLesson.starttime,
                            isBreak: true,
                            breakType: 'gap'
                        });
                    } else if (gapMinutes > 0) {
                        lessonsWithBreaks.push({
                            id: `break-${currentLesson.id}-${nextLesson.id}`,
                            name: `Szünet (${gapMinutes} perc)`,
                            starttime: currentLesson.endtime,
                            endtime: nextLesson.starttime,
                            isBreak: true,
                            breakType: 'short'
                        });
                    }
                }
            });

            updatedLessons[day] = lessonsWithBreaks;
        });

        return updatedLessons;
    };

    const fetchLessons = async (startDate: string, endDate: string, displayLoading: boolean = false): Promise<boolean> => {
        if (displayLoading) {
            if (loading.value) return false;
            loading.value = true;
        } else {
            if (backgroundLoading.value) return false;
            backgroundLoading.value = true;
        }

        try {
            const userStore = useUserStore();
            if (!userStore.isAuthenticated) throw new Error('No access token');

            const response = await fetch(
                `https://api.vasvariapp.hu/Lesson/GetLessonsByTimeframeForStudent?startDate=${startDate}&endDate=${endDate}&studentId=${userStore.uid}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            if (response.status === 404) {
                const updatedLessons = { ...lessonsByDay.value };
                Object.keys(updatedLessons).forEach(dateStr => {
                    const [year, month, day] = dateStr.split('.');
                    const lessonDate = new Date(`${year}-${month}-${day}`);
                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);

                    if (lessonDate >= startDateObj && lessonDate <= endDateObj) {
                        delete updatedLessons[dateStr];
                    }
                });
                lessonsByDay.value = updatedLessons;
                saveToLocalStorage();
                return true;
            }

            if (!response.ok) throw new Error('Failed to fetch lesson data');

            const data = await response.json();
            lessonsByDay.value = processLessonData(data, startDate, endDate);
            saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error fetching lessons:', error);
            return false;
        } finally {
            if (displayLoading) {
                loading.value = false;
            } else {
                backgroundLoading.value = false;
            }
        }
    };

    const refreshLessons = async (currentStartDate?: string, currentEndDate?: string, displayLoading: boolean = false) => {
        if (currentStartDate && currentEndDate) {
            await fetchLessons(currentStartDate, currentEndDate, displayLoading);
            return;
        }

        const allDates = Object.keys(lessonsByDay.value);
        if (allDates.length === 0) {
            const today = new Date();
            const twoWeeksLater = new Date();
            twoWeeksLater.setDate(today.getDate() + 14);
            await fetchLessons(
                today.toISOString().split('T')[0],
                twoWeeksLater.toISOString().split('T')[0],
                displayLoading
            );
            return;
        }

        const dateObjects = allDates.map(dateStr => {
            const [year, month, day] = dateStr.split('.');
            return new Date(`${year}-${month}-${day}`);
        });

        const earliestDate = new Date(Math.min(...dateObjects.map(d => d.getTime())));
        const latestDate = new Date(Math.max(...dateObjects.map(d => d.getTime())));
        earliestDate.setDate(earliestDate.getDate() - 7);
        latestDate.setDate(latestDate.getDate() + 14);

        await fetchLessons(
            earliestDate.toISOString().split('T')[0],
            latestDate.toISOString().split('T')[0],
            displayLoading
        );
    };

    return {
        lessonsByDay,
        loading,
        backgroundLoading,
        lastUpdate,
        loadFromLocalStorage,
        fetchLessons,
        refreshLessons
    };
});