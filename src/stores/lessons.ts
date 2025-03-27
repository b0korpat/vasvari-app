import {defineStore} from 'pinia';
import {ref} from 'vue';

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
            const response = await fetch(
                `https://backend-production-f2dd.up.railway.app/api/Lesson/GetLessonsByTimeframe?startDate=${startDate}&endDate=${endDate}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch lesson data');

            const data = await response.json();
            const groupedLessons: Record<string, any[]> = {};

            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}.${month}.${day}`;
            };

            const formatTime = (date: Date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            for (const lesson of data) {
                const day = formatDate(new Date(lesson.startTime));
                if (!groupedLessons[day]) groupedLessons[day] = [];
                groupedLessons[day].push({
                    id: lesson.id,
                    subjectName: lesson.subjectName,
                    displayName: lesson.subjectShortName || lesson.subjectName,
                    room: lesson.classRoomName || 'No room',
                    teachername: lesson.teacher,
                    date: lesson.startTime.split('T')[0],
                    studentGroupName: lesson.studentGroupName,
                    starttime: formatTime(new Date(lesson.startTime)),
                    endtime: formatTime(new Date(new Date(lesson.startTime).getTime() + 45 * 60 * 1000)),
                });
            }

            // Sort lessons by start time for each day
            for (const day in groupedLessons) {
                groupedLessons[day].sort((a, b) => {
                    const timeA = a.starttime.split(':').map(Number);
                    const timeB = b.starttime.split(':').map(Number);
                    return timeA[0] - timeB[0] || timeA[1] - timeB[1];
                });

                // Add "Szünet" or "Lyukasóra" based on the gap between lessons
                const lessonsWithBreaks: any[] = [];
                for (let i = 0; i < groupedLessons[day].length; i++) {
                    const currentLesson = groupedLessons[day][i];
                    lessonsWithBreaks.push(currentLesson);

                    if (i < groupedLessons[day].length - 1) {
                        const nextLesson = groupedLessons[day][i + 1];
                        const currentEndTime = currentLesson.endtime.split(':').map(Number);
                        const nextStartTime = nextLesson.starttime.split(':').map(Number);

                        const currentEndMinutes = currentEndTime[0] * 60 + currentEndTime[1];
                        const nextStartMinutes = nextStartTime[0] * 60 + nextStartTime[1];

                        const gapMinutes = nextStartMinutes - currentEndMinutes;

                        if (gapMinutes > 30) {
                            // Add "Lyukasóra" (gap lesson)
                            lessonsWithBreaks.push({
                                id: `gap-${currentLesson.id}-${nextLesson.id}`,
                                name: 'Lyukasóra',
                                starttime: currentLesson.endtime,
                                endtime: nextLesson.starttime,
                            });
                        } else if (gapMinutes > 0) {
                            // Always add "Szünet" (break)
                            lessonsWithBreaks.push({
                                id: `break-${currentLesson.id}-${nextLesson.id}`,
                                name: `Szünet (${gapMinutes} perc)`,
                                starttime: currentLesson.endtime,
                                endtime: nextLesson.starttime,
                            });
                        }
                    }
                }
                groupedLessons[day] = lessonsWithBreaks;
            }

            lessonsByDay.value = groupedLessons;
            saveToLocalStorage();
            console.log('Lessons updated from API:', lessonsByDay.value);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            loading.value = false;
        }
    };

    return {
        lessonsByDay,
        loading,
        loadFromLocalStorage,
        fetchLessons,
    };
});