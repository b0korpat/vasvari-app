import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from "@/stores/user";

export const useLessonStore = defineStore('lessonStore', () => {
    const lessonsByDay = ref<Record<string, any[]>>({});
    const loading = ref(false);

    const saveToLocalStorage = () => {
        localStorage.setItem('lessonsByDay', JSON.stringify(lessonsByDay.value));
        console.log('Lessons saved to localStorage:', lessonsByDay.value);
    };

    const loadFromLocalStorage = () => {
        const savedLessons = localStorage.getItem('lessonsByDay');
        if (savedLessons) {
            lessonsByDay.value = JSON.parse(savedLessons);
            console.log('Lessons loaded from localStorage:', lessonsByDay.value);
        } else {
            console.log('No lessons found in localStorage.');
        }
    };

    const fetchLessons = async (startDate: string, endDate: string, spinner: boolean): Promise<void> => {
        loading.value = spinner;
        console.log('Fetching lessons from API...');
        try {
            const userStore = useUserStore();
            const response = await fetch(
                `https://backend-production-f2dd.up.railway.app/api/Lesson/GetLessonsByTimeframeForStudent?startDate=${startDate}&endDate=${endDate}&studentId=${userStore.uid}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (response.status === 404) {
                localStorage.removeItem('lessonsByDay');
                lessonsByDay.value = {};
                console.log('No lessons found (404).');
                return;
            } else if (!response.ok) {
                throw new Error('Failed to fetch lesson data');
            }

            const data = await response.json();

            // 1. Prepare a copy of existing lessons so we can merge them
            const groupedLessons: Record<string, any[]> = { ...lessonsByDay.value };

            // Helper functions to format date/time
            const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}.${month}.${day}`;
            };

            const formatTime = (dateString: string) => {
                const date = new Date(dateString);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            // 2. Insert or update each lesson in groupedLessons
            for (const lesson of data) {
                const day = formatDate(lesson.startTime);

                // Ensure day array exists
                if (!groupedLessons[day]) {
                    groupedLessons[day] = [];
                }

                groupedLessons[day].push({
                    id: lesson.id,
                    subjectName: lesson.subjectName,
                    displayName: lesson.subjectShortName || lesson.subjectName,
                    room: lesson.classRoomName || 'No room',
                    teachername: lesson.teacher,
                    date: lesson.startTime.split('T')[0],
                    studentGroupName: lesson.studentGroupName,
                    starttime: formatTime(lesson.startTime),
                    endtime: formatTime(
                        new Date(
                            new Date(lesson.startTime).getTime() + 45 * 60 * 1000
                        ).toISOString()
                    ),
                    isBreak: false
                });
            }

            // 3. For each day, remove duplicates, sort, then add break lessons
            for (const day in groupedLessons) {
                // Remove duplicates based on unique ID (optional)
                const uniqueLessons = new Map<string, any>();
                for (const lesson of groupedLessons[day]) {
                    uniqueLessons.set(lesson.id, lesson);
                }
                // Convert map back to an array
                const mergedLessons = Array.from(uniqueLessons.values());

                // Sort by starttime
                mergedLessons.sort((a, b) => a.starttime.localeCompare(b.starttime));

                // Build final array with break lessons
                const lessonsWithBreaks: any[] = [];
                for (let i = 0; i < mergedLessons.length; i++) {
                    const currentLesson = mergedLessons[i];
                    lessonsWithBreaks.push(currentLesson);

                    // If there is a next lesson, check for breaks
                    if (i < mergedLessons.length - 1) {
                        const nextLesson = mergedLessons[i + 1];
                        const currentEnd = currentLesson.endtime.split(':').map(Number);
                        const nextStart = nextLesson.starttime.split(':').map(Number);

                        const currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
                        const nextStartMinutes = nextStart[0] * 60 + nextStart[1];
                        const gapMinutes = nextStartMinutes - currentEndMinutes;

                        if (gapMinutes > 30) {
                            // Add "Lyukasóra"
                            lessonsWithBreaks.push({
                                id: `gap-${currentLesson.id}-${nextLesson.id}`,
                                name: 'Lyukasóra',
                                starttime: currentLesson.endtime,
                                endtime: nextLesson.starttime,
                                isBreak: true,
                                breakType: 'gap'
                            });
                        } else if (gapMinutes > 0) {
                            // Add "Szünet" for smaller breaks
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
                }

                // Update final processed lessons
                groupedLessons[day] = lessonsWithBreaks;
            }

            // 4. Save merged and sorted lessons back to your store
            lessonsByDay.value = groupedLessons;
            saveToLocalStorage();
            console.log('Lessons updated from API:', lessonsByDay.value);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            loadFromLocalStorage();
        } finally {
            loading.value = false;
        }
    };

    return {
        lessonsByDay,
        loading,
        loadFromLocalStorage,
        fetchLessons
    };
});