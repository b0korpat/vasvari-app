import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { describe, it, expect, vi, beforeEach } from 'vitest';


describe('User Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
    });

    it('initializes user data from localStorage', () => {
        localStorage.setItem('firstName', 'John');
        localStorage.setItem('lastName', 'Doe');
        localStorage.setItem('email', 'john.doe@example.com');
        localStorage.setItem('uid', '12345');

        const store = useUserStore();
        expect(store.firstName).toBe('John');
        expect(store.lastName).toBe('Doe');
        expect(store.email).toBe('john.doe@example.com');
        expect(store.uid).toBe('12345');
    });

    it('returns truncated first name if it exceeds max length', () => {
        const store = useUserStore();
        store.firstName = 'VeryLongFirstNameExceedingLimit';
        expect(store.displayFirstName).toBe('VeryLongFirst...');
    });

    it('returns full name combining first and last names', () => {
        const store = useUserStore();
        store.firstName = 'John';
        store.lastName = 'Doe';
        expect(store.fullName).toBe('John Doe');
    });

    it('sets user data and updates localStorage', () => {
        const store = useUserStore();
        store.setUser({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            uid: '67890',
        });

        expect(store.firstName).toBe('Jane');
        expect(store.lastName).toBe('Smith');
        expect(store.email).toBe('jane.smith@example.com');
        expect(store.uid).toBe('67890');
        expect(localStorage.getItem('firstName')).toBe('Jane');
        expect(localStorage.getItem('lastName')).toBe('Smith');
        expect(localStorage.getItem('email')).toBe('jane.smith@example.com');
        expect(localStorage.getItem('uid')).toBe('67890');
    });

    it('clears user data and removes it from localStorage', () => {
        const store = useUserStore();
        store.setUser({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            uid: '67890',
        });

        store.clearUser();

        expect(store.firstName).toBe('');
        expect(store.lastName).toBe('');
        expect(store.email).toBe('');
        expect(store.uid).toBe('');
        expect(store.isAuthenticated).toBe(false);
        expect(localStorage.getItem('firstName')).toBeNull();
        expect(localStorage.getItem('lastName')).toBeNull();
        expect(localStorage.getItem('email')).toBeNull();
        expect(localStorage.getItem('uid')).toBeNull();
    });

    it('does not truncate first name if it is within max length', () => {
        const store = useUserStore();
        store.firstName = 'ShortName';
        expect(store.displayFirstName).toBe('ShortName');
    });

    it('does not truncate last name if it is within max length', () => {
        const store = useUserStore();
        store.lastName = 'ShortLastName';
        expect(store.displayLastName).toBe('ShortLastName');
    });

    it('truncates last name if it exceeds max length', () => {
        const store = useUserStore();
        store.lastName = 'VeryLongLastNameExceedingLimit';
        expect(store.displayLastName).toBe('VeryLongLastN...');
    });
});